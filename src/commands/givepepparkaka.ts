import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Command } from "../interfaces/Command";
import { createUser, getUserByDiscordId } from "../models/UserModel";

export class GivePepparkakaCommand implements Command {
    name = "givepepparkaka";
    description = "Ge någon eller en roll pepparkakor.";
    ephemeral = false;
    defer = true;
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .addIntegerOption(option => option.setName("amount").setDescription("Antal pepparkakor att ge").setRequired(true))
        .addUserOption(option => option.setName("user").setDescription("Användaren att ge pepparkakor till").setRequired(false))
        .addRoleOption(option => option.setName("role").setDescription("Rollen att ge pepparkakor till").setRequired(false));

    async execute(interaction: ChatInputCommandInteraction) {
        const user = interaction.options.getUser("user");
        const role = interaction.options.getRole("role");
        const amount = interaction.options.getInteger("amount", true);

        const target = user ? `<@${user.id}>` : role ? `Rollen <@&${role.id}>` : null;
        
        if (!target) {
            await interaction.editReply("Du måste specificera antingen en användare eller en roll att ge pepparkakor till.");
            return;
        }

        if( user ){
            let userData = await getUserByDiscordId(user.id);
            if (userData) {
                userData.points += amount;
                await userData.save();
            }else{
                userData = await createUser(user.id);
                userData.points = amount;
                await userData.save();
            }
        }else if( role ){
            const members = interaction.guild?.members.cache.filter(member => member.roles.cache.has(role.id));
            if (members) {
                for (const [, member] of members) {
                    let userData = await getUserByDiscordId(member.user.id);
                    if (userData) {
                        userData.points += amount;
                        await userData.save();
                    }else{
                        userData = await createUser(member.user.id);
                        userData.points = amount;
                        await userData.save();
                    }
                }
            }
        }

        await interaction.editReply(`Gav ${target} <:pepparkaka:1444788514653737101> ${amount} st pepparkakor.`);

    }   
}