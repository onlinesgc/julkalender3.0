import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";
import dotenv from "dotenv";
import { Command } from "./interfaces/Command";
import { Ready } from "./bot_events/ready";
import { PingCommand } from "./commands/ping";
import { InteractionCreate } from "./bot_events/interactionCreate";
import { Day } from "./commands/day";
import { SendDayCommand } from "./commands/sendDay";
import { PasswordCommand } from "./commands/password";
import { PepparkakorCommand } from "./commands/pepparkakor";
import { PepparkakorToplistCommand } from "./commands/pepparkakortoplist";
import { CreateLotteryCommand } from "./commands/skapalotteri";
import { EndLotteryCommand } from "./commands/avslutalotteri";
import { AddPasswordCommand } from "./commands/addpassword";

dotenv.config();

const TOKEN = process.env.DISCORD_BOT_TOKEN;

if (!TOKEN) {
  throw new Error("DISCORD_BOT_TOKEN is not defined in environment variables.");
}

export interface BotClient extends Client {
    commands: Collection<string, Command>;
    commandArray: Array<any>;
}

const client = new Client({
    partials : [Partials.Message, Partials.Channel, Partials.Reaction],
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent
    ]
}) as BotClient;

client.commands = new Collection();
client.commandArray = [];

// Register commands

const commands = [
    { name: "ping", instance: new PingCommand() },
    { name: "day", instance: new Day() },
    { name: "sendday", instance: new SendDayCommand() },
    { name: "password", instance: new PasswordCommand() },
    { name: "pepparkakor", instance: new PepparkakorCommand() },
    { name: "pepparkakortoplist", instance: new PepparkakorToplistCommand() },
    { name: "skapalotteri", instance: new CreateLotteryCommand() },
    { name: "avslutalotteri", instance: new EndLotteryCommand() },
    { name: "addpassword", instance: new AddPasswordCommand() }
];

for (const command of commands) {
    client.commands.set(command.name, command.instance);
    client.commandArray.push(command.instance.data.toJSON());
}

client.once("clientReady", async () => {
    const readyEvent = new Ready();
    await readyEvent.runEvent(client);
});


client.on("interactionCreate", async (interaction) => {
    const interactionCreate = new InteractionCreate();
    await interactionCreate.runEvent(client, interaction);
});

client.login(TOKEN);