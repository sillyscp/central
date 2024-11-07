import { Express } from "express";
import { Client } from "discord.js";
import {DiscordFetch} from "../utils/discord";

export default function (app: Express, client: Client) {
    app.post("/application", async (req, res) => {
        const auth = req.headers.authorization;
        if (!auth) return res.status(401).json({ error: "No authorization header" });
        if (auth !== process.env.APPLICATION_AUTH) return res.status(403).json({ error: "Invalid authorization" });
        const body = req.body as { userId: string };
        const guildMember = await new DiscordFetch(client).member("1279504339248877588", body.userId);
        if (!guildMember) return res.status(404).json({ error: "User not found" });
        await guildMember.send(`Thank you for applying to be staff at Silly SCP.
The relevant people have been informed and given your application, this process may take some time so be patient.
If you have any questions, feel free to make a ticket in the Discord and ask.`);
        return res.json({ success: true });
    });
}