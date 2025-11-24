import { ChatInputCommandInteraction } from "discord.js";

export interface Command {
    name: string;
    description: string;
    ephemeral: boolean;
    defer: boolean;
    data: any;
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}