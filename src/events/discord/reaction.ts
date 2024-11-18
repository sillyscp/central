import {Client, EmbedBuilder, Interaction, TextChannel} from 'discord.js';
import { commands } from '../..';
import {DiscordFetch} from "../../utils/discord";

export default async function (client: Client) {
    client.on('messageReactionAdd', async (interaction) => {
        if(!interaction.count || interaction.count > 1) return;
        const users = await interaction.users.fetch();
        if(users.size > 1) return;
        if(users.first()!.bot) return;
        const logsChannel = (await new DiscordFetch(interaction.client).channel("1295029840784920628"))! as TextChannel;
        const thread = (await logsChannel.threads.fetch("1295030367572721807"))!;
        const embed = new EmbedBuilder()
            .setTitle("Reaction Added")
            .setDescription(`A reaction was added to a message`)
            .addFields({
                name: "Message",
                value: `[Jump to message](https://discord.com/channels/${interaction.message.guildId}/${interaction.message.channelId}/${interaction.message.id})`
            }, {
                name: "Reaction",
                value: interaction.emoji.imageURL() || interaction.emoji.name || interaction.emoji.id || interaction.emoji.identifier
            }, {
                name: "User",
                value: `<@${users.first()!.id}> (${users.first()!.id})`
            });
        await thread.send({ embeds: [embed] });
    });
}
