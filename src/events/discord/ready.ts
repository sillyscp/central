import { Client, REST, Routes } from "discord.js";
import { commands } from "../..";
import { readdirSync } from "fs";
import path from "path";
import { Command, CommandNoRun } from "../../types/discord";

export default async function (client: Client) {
    client.on("ready", async () => {
        const commandFiles = readdirSync('./src/interactions', { recursive: true }).filter(file => !(file instanceof Buffer) && file.endsWith('.ts'));
        const loadedCommands: CommandNoRun[] = [];
        for (const file of commandFiles) {
            const command = (
                await import(`../../interactions/${file}`)
            ).default as Command & { type?: number };
            if (
                commands.get(
                    'name' in command ? command.name : command.custom_id,
                )
            )
                throw Error(
                    `Duplicate command name or custom_id (${file})`,
                );
            commands.set(
                'name' in command ? command.name : command.custom_id,
                command as Command,
            );
            if ('name' in command && command.role !== 'AUTOCOMPLETE') {
                if (command.role !== 'CHAT_INPUT')
                    command.type =
                        command.role === 'MESSAGE_CONTEXT_MENU' ? 3 : 2;
                const { run, default_member_permissions, ...rest } =
                    command;
                const add: CommandNoRun & {
                    default_member_permissions?: string;
                } = rest;
                if (default_member_permissions)
                    add.default_member_permissions =
                        default_member_permissions.toString();
                loadedCommands.push(add);
            }
        }
        const rest = new REST({ version: "10" }).setToken(
            process.env.TOKEN as string,
        );
        const commands_ = await rest.get(
            Routes.applicationCommands(process.env.CLIENT_ID as string),
        );
        if (
            !compareCommands(
                loadedCommands,
                commands_ as Record<string, unknown>[],
            )
        ) {
            await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID as string),
                { body: loadedCommands },
            );
        }
        console.log(
            `Logged in as ${client.user?.tag}! Loaded ${commands.size} interactions.`,
        );
    });
}

function compareCommands(
    commands1: Record<string, unknown>[],
    commands2: Record<string, unknown>[],
): boolean {
    if (commands1.length !== commands2.length) return false;
    for (const command in commands1) {
        if (!isDeepEqual(commands1[command], commands2[command])) return false;
    }
    return true;
}

const isDeepEqual = (
    object1: Record<string, unknown>,
    object2: Record<string, unknown>,
) => {
    const objKeys1 = Object.keys(object1);
    const objKeys2 = Object.keys(object2);

    if (objKeys1.length !== objKeys2.length) return false;

    for (const key of objKeys1) {
        const value1 = object1[key];
        const value2 = object2[key];

        const isObjects = isObject(value1) && isObject(value2);

        if (
            (isObjects &&
                !isDeepEqual(
                    value1 as Record<string, unknown>,
                    value2 as Record<string, unknown>,
                )) ||
            (!isObjects && value1 !== value2)
        ) {
            return false;
        }
    }
    return true;
};

const isObject = (object: unknown) => {
    return object != null && typeof object === "object";
};

function cwd() {
    return __dirname.split("/").slice(0, -2).join("/");
}
