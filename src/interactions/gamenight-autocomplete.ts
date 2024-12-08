import {Command} from "../types/discord";
import { gameNightNominations, votingEnabled } from "./gamenight";

export default {
    name: "gamenight-autocomplete",
    role: "AUTOCOMPLETE",
    run: async (interaction) => {
        if(!interaction.guild) return;
        if(!interaction.channel) return;
        if(!votingEnabled) return;
        await interaction.respond(gameNightNominations.map(n => ({ name: n, value: n })));
    }
} satisfies Command;