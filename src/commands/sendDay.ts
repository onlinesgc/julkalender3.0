import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, GuildTextBasedChannel, SlashCommandBuilder } from "discord.js";
import { Command } from "../interfaces/Command";
import { getDay } from "../models/DayModel";
import { getClientById } from "../models/ClientModel";

export class SendDayCommand implements Command {
    name = "sendday";
    description = "Sends the content for a specific day.";
    ephemeral = false;
    defer = true;
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .setDefaultMemberPermissions(0)
        .addIntegerOption(option => option.setName("day").setDescription("The day number (1-24)").setRequired(true))
        .addChannelOption(option => option.setName("channel").setDescription("The channel to send the day content to").setRequired(true))
        .addBooleanOption(option => option.setName("ping").setDescription("Whether to ping the advent role").setRequired(false));
    async execute(interaction: ChatInputCommandInteraction) {
        const channel = interaction.options.getChannel("channel", true) as GuildTextBasedChannel;
        const dayNum = interaction.options.getInteger("day", true);
        const ping = interaction.options.getBoolean("ping") ?? true;
        
        const day = await getDay(dayNum);
        if(!day){
            await interaction.editReply({ content: `Day ${dayNum} does not exist.` });
            return;
        }
        await this.sendDay(channel, dayNum, interaction.client.user.id, ping);
        await interaction.editReply({ content: `Day ${dayNum} sent to ${channel.toString()}.` });
    }

    async sendDay(channel: GuildTextBasedChannel, dayNum: number, clientId: string, ping: boolean = true) {
        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('day;' + dayNum)
                    .setStyle(ButtonStyle.Danger)
                    .setLabel(`Lucka ${dayNum}`),
            );
        const clientData = await getClientById(clientId);
        if (ping) await channel.send({ content: clientData?.adventPingRole ? `<@&${clientData.adventPingRole}>` : "", components: [row] });
        else await channel.send({ components: [row] });
    }
}