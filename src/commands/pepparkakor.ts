import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../interfaces/Command";
import { getUserByDiscordId } from "../models/UserModel";

export class PepparkakorCommand implements Command {
    name = "pepparkakor";
    description = "Kolla hur många pepparkakor du har samlat!";
    ephemeral = true;
    defer = true;
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .addUserOption(option => option.setName("user").setDescription("The user to check pepparkakor for").setRequired(false));
    async execute(interaction: ChatInputCommandInteraction) {
        const user = interaction.options.getUser("user") || interaction.user;
        
        const userData = await getUserByDiscordId(user.id);
        const points = userData ? userData.points : 0;

        interaction.editReply({ content: `${user.username} har samlat ihop ${points} st pepparkakor.` });
    }
    
}