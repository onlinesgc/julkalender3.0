import { Client } from "discord.js";

export interface Event{
    runEvent: (client: Client, ...args: any[]) => Promise<void>;  
}