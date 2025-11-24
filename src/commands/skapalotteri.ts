import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, GuildTextBasedChannel, ModalBuilder, ModalSubmitInteraction, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { Command } from "../interfaces/Command";
import { createLottery, getLotteryById } from "../models/lotteryModel";
import { getClientById } from "../models/ClientModel";

export class CreateLotteryCommand implements Command {
    name = "skapalotteri";
    description = "Skapar ett lotteri (admin only)";
    ephemeral = false;
    defer = false;
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .setDefaultMemberPermissions(0);
    async execute (interaction: ChatInputCommandInteraction) {
        const model = new ModalBuilder()
            .setTitle("Skapa Lotteri")
            .setCustomId("create_lottery_modal");

        const row = new ActionRowBuilder<TextInputBuilder>()
            .addComponents(
                new TextInputBuilder()
                    .setCustomId("lottery_name_input")
                    .setLabel("Text för lotteri")
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true)
            );
        model.addComponents(row);
        await interaction.showModal(model);

        const filter = (i: ModalSubmitInteraction) => i.customId === "create_lottery_modal" && i.user.id === interaction.user.id;
        const subbmited = await interaction.awaitModalSubmit({ filter, time: 5 * 60 * 1000 })
            .catch(() => null);

        if(!subbmited) {
            await interaction.followUp({ content: "Tiden för att fylla i modalen har gått ut.", ephemeral: true });
            return;
        }
        
        const textLottey = subbmited.fields.getTextInputValue("lottery_name_input");
        
        const lotteryData = await createLottery();
        await subbmited.reply({ content: `Lotteri har skapats med id ${lotteryData._id}`, ephemeral: false });

        const clientData = await getClientById(interaction.client.user!.id);
        
        const channel = interaction.client.channels.cache.get(clientData?.adventchannel || "");
        if(!channel || !channel.isTextBased()) return;

        const buttonRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`bet_lottery;${lotteryData._id}`)
                    .setLabel(`Lägg in pepparkaka`)
                    .setStyle(ButtonStyle.Primary)
            );

        const message = await (channel as GuildTextBasedChannel).send({ content: textLottey , components: [buttonRow] });
        lotteryData.messageId = message.id;
        lotteryData.channelId = message.channelId;
        await lotteryData.save();
    }
    
}