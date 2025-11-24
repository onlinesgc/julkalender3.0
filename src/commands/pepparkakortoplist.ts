import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, EmbedBuilder, EmbedField, SlashCommandBuilder } from "discord.js";
import { Command } from "../interfaces/Command";
import { getAllUsers } from "../models/UserModel";

export class PepparkakorToplistCommand implements Command {
    name = "pepparkakortoplist";
    description = "Genererar en topplista över folks pepparkakor likt xptoplist.";
    ephemeral = false;
    defer = true;
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description);
    async execute (interaction: ChatInputCommandInteraction){
        const allUsers = await getAllUsers();
        allUsers.sort((a, b) => b.points - a.points);
        const usersPerPage = 10;
        let pointer = 0;
        
        const toplist = new EmbedBuilder()
            .setTitle("Pepparkakor Topplista")
            .addFields(await this.generateFields(allUsers, pointer, usersPerPage))
            .setColor("Red")
            .setFooter({ text: `Visar ${Math.min(usersPerPage, allUsers.length - pointer)} av ${allUsers.length} användare` });
        
        const dirButtons = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('pepparkakortoplist_prev')
                    .setLabel('Föregående')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(pointer === 0),
                new ButtonBuilder()
                    .setCustomId('pepparkakortoplist_next')
                    .setLabel('Nästa')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(pointer + usersPerPage >= allUsers.length),
            );
        
        await interaction.editReply({ embeds: [toplist], components: [dirButtons] });

        const collector = interaction.channel?.createMessageComponentCollector({ filter: i => i.user.id === interaction.user.id, time: 5 * 60 * 1000 });
        
        collector?.on('collect', async i => {
            if(i.customId === 'pepparkakortoplist_next'){
                pointer += usersPerPage;
            }else if(i.customId === 'pepparkakortoplist_prev'){
                pointer -= usersPerPage;
            }
            const updatedEmbed = new EmbedBuilder()
                .setTitle("Pepparkakor Topplista")
                .addFields(await this.generateFields(allUsers, pointer, usersPerPage))
                .setColor("Red")
                .setFooter({ text: `Visar ${Math.min(usersPerPage, allUsers.length - pointer)} av ${allUsers.length} användare` });
            
            const updatedButtons = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('pepparkakortoplist_prev')
                        .setLabel('Föregående')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(pointer === 0),
                    new ButtonBuilder()
                        .setCustomId('pepparkakortoplist_next')
                        .setLabel('Nästa')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(pointer + usersPerPage >= allUsers.length),
                );
            
            await i.update({ embeds: [updatedEmbed], components: [updatedButtons] });

        });
        collector?.on('end', async () => {
            await interaction.editReply({ components: [] });
        });

    }

    private async generateFields(users: any[], startIndex: number, userCount: number) : Promise<EmbedField[]> {
        const fields: EmbedField[] = [];
        const endIndex = Math.min(startIndex + userCount, users.length);
        
        for(let i = startIndex; i < endIndex; i++){
            const user = users[i];
            fields.push({
                name: `${i + 1}`,
                value: `<@${user.discordId}> - ${user.points} pepparkakor`,
                inline: false
            });
        }
        return fields;
    }
    
}