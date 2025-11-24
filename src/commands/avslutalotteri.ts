import { ChatInputCommandInteraction, SlashCommandBuilder, TextBasedChannel } from "discord.js";
import { Command } from "../interfaces/Command";
import { getLotteryById } from "../models/lotteryModel";

export class EndLotteryCommand implements Command {
    name = "avslutalotteri";
    description = "Avslutar ett lotteri (admin only)";
    ephemeral = false;
    defer = true;
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption(option => option.setName("lottery_id").setDescription("ID för lotteriet som ska avslutas").setRequired(true))
        .setDefaultMemberPermissions(0);
    async execute (interaction: ChatInputCommandInteraction){
        const lotteryId = interaction.options.getString("lottery_id", true);

        const lottery = await getLotteryById(lotteryId);

        if(!lottery){
            await interaction.reply({ content: `Lotteri med ID ${lotteryId} hittades inte.`, ephemeral: true });
            return;
        }

        const messageId = lottery.messageId;

        const channel = await interaction.client.channels.fetch(lottery.channelId!);

        const message = await (channel as TextBasedChannel)?.messages.fetch(messageId!);

        message?.edit({ content: `Lotteri med ID ${lotteryId} är avslutat!`, components: [] });


        const allBets = lottery.amountBetted;

        let betedString = "Här är alla som har lagt in pepparkakor i lotteriet:\n";
        for(const bet of allBets){
            betedString += `<@${bet.userId}> - ${bet.amount} pepparkakor\n`;
        }

        await interaction.editReply({ content: `Lotteri med ID ${lotteryId} har avslutats. \n\n${betedString}` });
    }

}