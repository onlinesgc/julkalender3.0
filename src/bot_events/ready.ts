import { Client, Guild, GuildTextBasedChannel, REST, Routes } from "discord.js";
import { Event } from "../interfaces/Event";
import { BotClient } from "..";
import mongoose from "mongoose";
import { createClient, getClientById } from "../models/ClientModel";
import { getDay } from "../models/DayModel";
import { SendDayCommand } from "../commands/sendDay";

export class Ready implements Event {
    async runEvent(client: Client){
        console.log(`${client.user?.username} is online! ` + `Hosting ${client.users.cache.size} users, ` + `in ${client.channels.cache.size} ` +`channels of ${client.guilds.cache.size} guilds.`);
        await this.loadCommands(client as BotClient);
        await this.connectToDatabase();

        const clientData = await getClientById(client.user!.id);
        if(!clientData){
            console.log("No client data found, creating new entry in database.");
            await createClient(client.user!.id);
        }
        this.startTimeInterval(client as BotClient);
    }

    private async loadCommands(client: BotClient){
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN!);
        const debug = process.env.DEBUG === 'true';
        let routeFunc;
        if(debug){
            routeFunc = Routes.applicationGuildCommands(client.user?.id!, '813844220694757447')
        }else{
            routeFunc = Routes.applicationCommands(client.user?.id!);
        }

        await rest.put(routeFunc, { body: client.commandArray }).catch(console.error);
    }

    private async connectToDatabase(){
        await mongoose.connect(process.env.MONGODB_URI || "");
    }

    private async startTimeInterval(client: BotClient){
        setInterval(async () => {
            const day = new Date().getDate();
            const hour = new Date().getHours();
            const dayData = await getDay(day);
            if(dayData && !dayData.hasSentAuto && hour >= 8){
                const channelId = (await getClientById(client.user!.id))?.adventchannel;
                if(!channelId) return;
                const channel = await client.channels.fetch(channelId);
                if(!channel || !channel.isTextBased()) return;
                new SendDayCommand().sendDay(channel as GuildTextBasedChannel, day, client.user!.id);
                dayData.hasSentAuto = true;
                await dayData.save();
            }

        }, 1000*10);
    }
} 