import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../interfaces/Command";
import { getPassword } from "../models/PasswordModel";
import { createUser, getUserByDiscordId } from "../models/UserModel";

export class PasswordCommand implements Command {
    name = "password";
    description = "Redeema dinna pepparkakor"
    ephemeral = true;
    defer = true;
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .setDefaultMemberPermissions(0)
        .addStringOption(option => option.setName("password").setDescription("The password to redeem").setRequired(true));
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const passwordInput = interaction.options.getString("password", true);

        const passwordData = await getPassword(passwordInput);
        if(!passwordData){
            await interaction.editReply({ content: "Detta lösenord är fel! Försök igen med något annat." });
            return;
        }

        let userData = await getUserByDiscordId(interaction.user.id);
        if(!userData){
            userData = await createUser(interaction.user.id);
        }

        if(userData.passwordesRedeemed.includes(passwordInput)){
            await interaction.editReply({ content: "Du har redan använt detta lösenord! Det kommer komma fler lösenord i framtiden, håll utkik!" });
            return;
        }

        userData.passwordesRedeemed.push(passwordInput);
        userData.points += passwordData.points;
        await userData.save();

        await interaction.editReply({ content: `Grattis, du har skrivit in rätt svar! Du har nu fått pepparkakor!` });
    }
}