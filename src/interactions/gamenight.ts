import { Command } from "../types/discord";
import {DiscordFetch} from "../utils/discord";

let gameNightEnabled = false;
export let gameNightNominations: string[] = [];
export let votingEnabled = false;

let votes: Record<string, string[]> = {};

export default {
    name: "gamenight",
    description: "For all game night related commands",
    role: "CHAT_INPUT",
    options: [
        {
            type: 1,
            name: "start",
            description: "Start a game night voting session",
        },
        {
            type: 1,
            name: "nominate",
            description: "Nominate yourself as the next host"
        },
        {
            type: 1,
            name: "vote",
            description: "Vote for the next host",
            options: [
                {
                    type: 3,
                    name: "user",
                    description: "The user you want to vote for",
                    required: true,
                    autocomplete: true
                }
            ]
        }
    ],
    contexts: [0],
    run: async (interaction) => {
        if(!interaction.guild) return;
        if(!interaction.channel) return;
        const subcommand = interaction.options.getSubcommand(true);
        switch (subcommand) {
            case "start": {
                if(interaction.channel.id !== "1315289397964570765") return;
                if(gameNightEnabled) return await interaction.reply({
                    content: "A game night is already in progress!",
                    ephemeral: true
                });
                gameNightEnabled = true;
                await interaction.channel.send("<@&1315288978512941077> A game night is starting! Use `/gamenight nominate` to nominate yourself as the next host!");
                setTimeout(() => {
                    votingEnabled = true;
                    interaction.channel!.send("<@&1315288978512941077> Voting has started! Use `/gamenight vote` to vote for the next host!");
                    setTimeout(async () => {
                        votingEnabled = false;
                        gameNightEnabled = false;
                        let winner = Object.keys(votes).sort((a, b) => votes[b].length - votes[a].length)[0];
                        if(!winner) return interaction.channel!.send("No one was voted for!");
                        const guild = await new DiscordFetch(interaction.client).guild(interaction.guildId!);
                        if(!guild) return;
                        const member = (await guild.members.fetch()).find(m => m.user.tag === winner);
                        if(!member) return;
                        await interaction.channel!.send(`The winner is <@${member.id}>! They have 24 hours until their game night role is removed.`);
                        await member.roles.add("1315295804118011914");
                        gameNightNominations = [];
                        votes = {};
                        setTimeout(() => {
                            new DiscordFetch(interaction.client).role(interaction.guildId!, "1315295804118011914").then(role => {
                                if(!role) return;
                                role.members.forEach(member => {
                                    member.roles.remove(role);
                                });
                            })
                        }, 24 * 60 * 60 * 1000);
                    }, 6 * 60 * 60 * 1000);
                }, 6 * 60 * 60 * 1000);
                await interaction.reply({
                    content: "Game night started!",
                    ephemeral: true
                });
                break;
            }
            case "nominate": {
                if(!gameNightEnabled) return await interaction.reply({
                    content: "There is no game night in progress!",
                    ephemeral: true
                });
                if(gameNightNominations.includes(interaction.user.id)) return await interaction.reply({
                    content: "You have already nominated yourself!",
                    ephemeral: true
                });
                gameNightNominations.push(interaction.user.tag);
                await interaction.reply({
                    content: "You have nominated yourself!",
                    ephemeral: true
                });
                break;
            }
            case "vote": {
                if(!gameNightEnabled) return await interaction.reply({
                    content: "There is no game night in progress!",
                    ephemeral: true
                });
                if(!votingEnabled) return await interaction.reply({
                    content: "Voting has not started yet!",
                    ephemeral: true
                });
                const user = interaction.options.getString("user", true);
                if(user === interaction.user.tag) return await interaction.reply({
                    content: "You cannot vote for yourself!",
                    ephemeral: true
                });
                if(!gameNightNominations.includes(user)) return await interaction.reply({
                    content: "That user has not nominated themselves!",
                    ephemeral: true
                });
                for (let value of Object.values(votes)) {
                    if(value.includes(interaction.user.id)) return await interaction.reply({
                        content: "You have already voted!",
                        ephemeral: true
                    });
                }
                if(!votes[user]) votes[user] = [];
                votes[user].push(interaction.user.id);
                await interaction.reply({
                    content: `You have voted for ${user}!`,
                    ephemeral: true
                });
                break;
            }
        }
    }
} satisfies Command;