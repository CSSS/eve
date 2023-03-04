import { SapphireClient as Client } from "@sapphire/framework";
import { GatewayIntentBits } from "discord.js";
import dotenv from 'dotenv';
dotenv.config()
const bot = new Client({ intents: [
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.Guilds
    ] })

namespace Bot {
    export const Client = bot;
    export async function Start() {
        await bot.login(process.env.BOT_TOKEN);
    }
    export function GetUser(id: string) {
        return bot.users.fetch(id);
    }
}

export default Bot;

