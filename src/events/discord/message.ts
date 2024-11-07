import {Client, Interaction, Message} from 'discord.js';
import { commands } from '../..';

export default async function (client: Client) {
    client.on('messageCreate', async (message) => {
        await messageEvent(message);
    });
    client.on('messageUpdate', async (old, message) => {
        if(old.content === message.content) return;
        if(message.partial) message = await message.fetch();
        await messageEvent(message);
    });
}

async function messageEvent(message: Message) {
    if(!message.guild) return;
    if((message.channelId === "1303715569664790559" || message.channelId === "1304022234796654604") && (!message.attachments.size || !message.content.includes('https://')) && !message.thread) await message.delete()
}