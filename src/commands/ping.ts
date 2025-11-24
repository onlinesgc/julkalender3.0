import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Command } from "../interfaces/Command";

export class PingCommand implements Command {
    name = "ping";
    description = "Replies with Pong!";
    ephemeral = false;
    defer = true;
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description);

    async execute(interaction: ChatInputCommandInteraction) {
        const pining_embed = new EmbedBuilder()
            .setColor("#2DD21C")
            .setTitle(":ping_pong:  Ping")
            .setDescription(`Pingar...`)
            .setFooter({
                text: this.name,
                iconURL: interaction.client.user.avatarURL()?.toString(),
            })
            .setTimestamp();
        const message = await interaction.editReply({ embeds: [pining_embed] });

        pining_embed.setDescription(
            `Tog ${message.createdTimestamp - interaction.createdTimestamp} millisekunder!`,
        );
        pining_embed.setTitle(":ping_pong:  Pong");
        interaction.editReply({ embeds: [pining_embed] });
    }   
}