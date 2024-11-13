import { Express } from "express";
import { Client } from "discord.js";
import {DiscordFetch} from "../utils/discord";

export default function (app: Express, client: Client) {
    app.get("/banned", async (req, res) => {
        const auth = req.headers.authorization;
        if (!auth) return res.status(401).json({ success: false, error: "No authorization header" });
        if (auth !== process.env.APPLICATION_AUTH) return res.status(403).json({ success: false, error: "Invalid authorization" });
        const url = new URL(req.url, `https://${req.headers.host}`);
        const userId = url.searchParams.get("userId");
        if (!userId) return res.status(400).json({ success: false, error: "No user ID provided" });
        const bans = await (await new DiscordFetch(client).guild("1279504339248877588"))!.bans.fetch();
        const banned = bans.find(ban => ban.user.id === userId);
        if (!banned) return res.status(404).json({ error: "User not found", success: false });
        return res.json({ success: true });
    });
}