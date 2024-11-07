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
    const hasAttachment = message.attachments.size > 0;
    const hasLink = message.content.includes('https://');
    if((message.channelId === "1304022234796654604" || message.channelId === "1303715569664790559") && !hasAttachment && !hasLink && !message.thread) await message.delete()
}