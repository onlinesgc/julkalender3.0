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

const pingCommand = new PingCommand();
client.commands.set("ping", pingCommand);
client.commandArray.push(pingCommand.data.toJSON());

const dayCommand = new Day();
client.commands.set("day", dayCommand);
client.commandArray.push(dayCommand.data.toJSON());

const sendDayCommand = new SendDayCommand();
client.commands.set("sendday", sendDayCommand);
client.commandArray.push(sendDayCommand.data.toJSON());

const passwordCommand = new PasswordCommand();
client.commands.set("password", passwordCommand);
client.commandArray.push(passwordCommand.data.toJSON());

const gingerbreadCommand = new PepparkakorCommand();
client.commands.set("pepparkakor", gingerbreadCommand);
client.commandArray.push(gingerbreadCommand.data.toJSON());

const gingerbreadToplistCommand = new PepparkakorToplistCommand();
client.commands.set("pepparkakortoplist", gingerbreadToplistCommand);
client.commandArray.push(gingerbreadToplistCommand.data.toJSON());

const createLotteryCommand = new CreateLotteryCommand();
client.commands.set("skapalotteri", createLotteryCommand);
client.commandArray.push(createLotteryCommand.data.toJSON());

const endLotteryCommand = new EndLotteryCommand();
client.commands.set("avslutalotteri", endLotteryCommand);
client.commandArray.push(endLotteryCommand.data.toJSON());

const addPasswordCommand = new AddPasswordCommand();
client.commands.set("addpassword", addPasswordCommand);
client.commandArray.push(addPasswordCommand.data.toJSON());

client.once("clientReady", async () => {
    const readyEvent = new Ready();
    await readyEvent.runEvent(client);
});


client.on("interactionCreate", async (interaction) => {
    const interactionCreate = new InteractionCreate();
    await interactionCreate.runEvent(client, interaction);
});

client.login(TOKEN);