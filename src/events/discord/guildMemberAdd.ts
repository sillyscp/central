import {Client, Interaction, Message} from 'discord.js';
import { commands } from '../..';

export default async function (client: Client) {
    client.on('guildMemberAdd', async (member) => {
        const joinedDiscord = member.user.createdTimestamp;
        const days14 = 60 * 60 * 24 * 14 * 1000;
        if(!member.user.bot && Date.now() - joinedDiscord < days14) {
            const time = days14 - (Date.now() - joinedDiscord);
            await member.timeout(time, "Account is not 14 days old");
            await member.send(`You have been timed out until your account is 14 days old. This is a spam prevention measure and won't be removed.`).catch(() => {});
        }
    })
}