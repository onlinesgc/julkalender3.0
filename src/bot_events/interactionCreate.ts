import { Client, CommandInteraction, Interaction } from "discord.js";
import { Event } from "../interfaces/Event";
import { BotClient } from "..";

export class InteractionCreate implements Event {
    async runEvent (client: Client, interaction: Interaction){
        if(interaction.isCommand()){
            await this.onCommand(interaction);
        }
    }
    async onCommand(interaction: CommandInteraction){
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
    
}