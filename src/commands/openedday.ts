import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../interfaces/Command";
import { getAllUsers } from "../models/UserModel";

export class OpenedDayd implements Command {
    name = "openedday";
    description = "Amount of pepole that have opened a day.";
    ephemeral = false;
    defer = true;
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .addIntegerOption(option => option.setName("day").setDescription("The day number (1-24)").setRequired(true))
        .addStringOption(option => option.setName("password").setDescription("This day's password").setRequired(false));
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const dayNum = interaction.options.getInteger("day", true);
        const password = interaction.options.getString("password", false);

        const users = await getAllUsers();
        let openedCount = 0;
        let opendAndUsedPassword = 0;
        
        users.forEach(user => {
            if (user.days.includes(dayNum)) {
                openedCount++;
                if (password && user.passwordesRedeemed.includes(password)) {
                    opendAndUsedPassword++;
                }
            }
        });
        if (password) {
            await interaction.editReply(`Antalet personer som har öppnat dag ${dayNum}: **${openedCount}**, av dem har **${opendAndUsedPassword}** använt lösenordet.`);
        }else{
            await interaction.editReply(`Antalet personer som har öppnat dag ${dayNum}: **${openedCount}**`);
        }
    }
}