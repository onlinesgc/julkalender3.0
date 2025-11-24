import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../interfaces/Command";
import { createPassword } from "../models/PasswordModel";

export class AddPasswordCommand implements Command {
    name = "addpassword";
    description = "Adds a password to the system.";
    ephemeral = false;
    defer = true;
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .setDefaultMemberPermissions(0)
        .addStringOption(option => option.setName("password").setDescription("The password to add").setRequired(true))
        .addNumberOption(option => option.setName("points").setDescription("The points to add with the password").setRequired(true));
    async execute(interaction: ChatInputCommandInteraction){
        const password = interaction.options.getString("password", true);
        const points = interaction.options.getNumber("points", true);

        await createPassword(password, points);

        await interaction.editReply({ content: `Password added` });
    }
    
}