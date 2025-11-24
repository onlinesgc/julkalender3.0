import { ActionRowBuilder, Attachment, ChatInputCommandInteraction, ModalBuilder, ModalSubmitInteraction, SlashCommandBuilder, TextInputBuilder } from "discord.js";
import { Command } from "../interfaces/Command";
import { createDay, getDay } from "../models/DayModel";
import { existsSync, mkdirSync, writeFileSync } from "fs";

export class Day implements Command {
    name = "day";
    description = "Create or manage a day in the advent calendar.";
    ephemeral = false;
    defer = false;
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .setDefaultMemberPermissions(0)
        .addIntegerOption(option => option.setName("day").setDescription("The day number (1-24)").setRequired(true))
        .addAttachmentOption(option => option.setName("attachement").setDescription("Attachment for the day").setRequired(false))
    async execute (interaction: ChatInputCommandInteraction){
        const dayNum = interaction.options.getInteger("day", true);
        const attachment = interaction.options.getAttachment("attachement");

        let day = await getDay(dayNum);

        if(!day){
            day = await createDay(dayNum, `Temp`);
        }

        if(attachment){
            day.imgUrl = await this.handleAttchment(attachment);
            await day.save();
        }

        const modal = new ModalBuilder()
            .setCustomId(`day_modal_${dayNum}`)
            .setTitle(`Edit Day ${dayNum}`);

        
        const textInput = new TextInputBuilder()
            .setCustomId("day_text")
            .setLabel("Day Text")
            .setStyle(2)
            .setPlaceholder("Enter the text for this day")
            .setValue(day.text)
            .setRequired(true);

        const row = new ActionRowBuilder<TextInputBuilder>().addComponents(textInput);
        modal.addComponents(row);
        
        await interaction.showModal(modal);

        const filter = (i: ModalSubmitInteraction) => i.customId === `day_modal_${dayNum}` && i.user.id === interaction.user.id;
        const submitted = await interaction.awaitModalSubmit({ filter, time: 15 * 60 * 1000 }).catch(() => null);
        if(submitted){
            const newText = submitted.fields.getTextInputValue("day_text");
            day.text = newText;
            await day.save();
            await submitted.reply({ content: `Day ${dayNum} updated successfully!`, ephemeral: true });
        }else{
            await interaction.followUp({ content: "You did not submit the modal in time.", ephemeral: true });
        }
    }


    async handleAttchment(attachemnt: Attachment | null | undefined){
        if(!attachemnt) return "";
        if(!existsSync("./attachments/")){
            mkdirSync("./attachments/");
        }
        const response = await fetch(attachemnt.url);
        const buffer = await response.arrayBuffer();
        const filePath = `./attachments/${attachemnt.id}_${attachemnt.name}`;
        writeFileSync(filePath, Buffer.from(buffer));
        return filePath;
    }
}