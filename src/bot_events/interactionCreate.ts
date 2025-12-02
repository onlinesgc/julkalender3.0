import { AttachmentBuilder, ButtonInteraction, ChatInputCommandInteraction, Client, CommandInteraction, EmbedBuilder, Interaction } from "discord.js";
import { Event } from "../interfaces/Event";
import { BotClient } from "..";
import { getDay } from "../models/DayModel";
import { createUser, getUserByDiscordId } from "../models/UserModel";
import { getLotteryById } from "../models/lotteryModel";

export class InteractionCreate implements Event {
    async runEvent (client: Client, interaction: Interaction){

        if(interaction.inGuild() === false) return;
        try{
            if(interaction.isCommand()){
                await this.onCommand(interaction as ChatInputCommandInteraction);
            }
            if(interaction.isButton()){
                await this.dayButton(interaction as ButtonInteraction);
                await this.lotteryButton(interaction as ButtonInteraction);
            }

        }
        catch(error){
            console.error(error);
        }
    }
    async onCommand(interaction: ChatInputCommandInteraction){
        const client = interaction.client as BotClient;
        const command = client.commands.get(interaction.commandName);
        if(!command) return;
        
        try{
            if(command.defer){
                await interaction.deferReply({ ephemeral: command.ephemeral });
            }
            await command.execute(interaction);
        }catch(error){
            console.error(error);
            if(interaction.deferred || interaction.replied){
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            }else{
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    }
    
    async dayButton(interaction: ButtonInteraction){
        const [prefix, dayStr] = interaction.customId.split(";");


        if(prefix !== "day") return;
        const dayNum = parseInt(dayStr);
        const dayData = await getDay(dayNum);
        if(!dayData){
            await interaction.reply({ content: `Day ${dayNum} does not exist.`, ephemeral: true });
            return;
        }
        
        let userData = await getUserByDiscordId(interaction.user.id);
        if(userData){
            await userData.save();
        }else{
            userData = await createUser(interaction.user.id);
            await userData.save();
        }

        if(userData.days.includes(dayNum)){
            await interaction.reply({ content: `Du har redan öppnat lucka ${dayNum}!`, ephemeral: true });
            return;
        }

        userData.days.push(dayNum);
        await userData.save();

        const embed = new EmbedBuilder()
            .setTitle(`Lucka ${dayData.day} av 24, SGC:s discord julkalender`)
            .setDescription(dayData.text)
            .setColor("Red")
            .setFooter({ text: `Julkalender 2025`, iconURL: interaction.client.user?.avatarURL() || undefined })
            .setTimestamp();

        await interaction.user
            .send({ embeds: [embed] })
            .catch(async (err) =>  interaction.reply({content:"För att få julkalender så måste du sätta på dms från servern!",ephemeral:true}));

        interaction.deferUpdate();
        let files = [];
        if(dayData.imgUrl){
            files.push(new AttachmentBuilder(dayData.imgUrl));
        }

        if(dayData.attachments && dayData.attachments.length > 0){
            for(const att of dayData.attachments){
                files.push(new AttachmentBuilder(att));
            }
        }

        if(files.length > 0){
            await interaction.user.send({ files }).catch(err => {});
        }

        if(dayData.link){
            await interaction.user.send({ content: `${dayData.link}` }).catch(err => {});
        }
    }

    async lotteryButton(interaction: ButtonInteraction){
        const [prefix, lotteryIdStr] = interaction.customId.split(";");

        if(prefix !== "bet_lottery") return;
        const lottery = await getLotteryById(lotteryIdStr);

        if(!lottery){
            await interaction.reply({ content: "Lotteriet finns inte längre.", ephemeral: true });
            return;
        }

        let userData = await getUserByDiscordId(interaction.user.id);
        if(!userData){
            userData = await createUser(interaction.user.id);
            await userData.save();
        }

        if(userData.points < 1){
            await interaction.reply({ content: "Du har inte tillräckligt med pepparkakor för att satsa.", ephemeral: true });
            return;
        }
        userData.points -= 1;
        lottery.amountBetted.find(entry => entry.userId === interaction.user.id) ?
            lottery.amountBetted.find(entry => entry.userId === interaction.user.id)!.amount += 1 :
            lottery.amountBetted.push({ userId: interaction.user.id, amount: 1 });
        await userData.save();
        await lottery.save();

        await interaction.reply({ content: `Du har lagt in ${lottery.amountBetted.find(entry => entry.userId === interaction.user.id)?.amount || 0} antal pepparkakor i lotteri ${lotteryIdStr}. Klicka för att lägga till en till.`, ephemeral: true });
    }
}