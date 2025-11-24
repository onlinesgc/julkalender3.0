import { Client, REST, Routes } from "discord.js";
import { Event } from "../interfaces/Event";
import { BotClient } from "..";

export class Ready implements Event {
    async runEvent(client: Client){
        console.log(`${client.user?.username} is online! ` + `Hosting ${client.users.cache.size} users, ` + `in ${client.channels.cache.size} ` +`channels of ${client.guilds.cache.size} guilds.`);
        await this.loadCommands(client as BotClient);
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
} 