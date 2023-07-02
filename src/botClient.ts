import { SapphireClient as Client } from "@sapphire/framework";
import { GatewayIntentBits } from "discord.js";
import dotenv from 'dotenv';
import WinstonLogger from "./logging/logger";
dotenv.config()
const bot = new Client({ intents: [
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.Guilds
    ] })

namespace Bot {
    export const Client = bot;
    export async function Start() {
        await WinstonLogger.Initialise()
        console.log("Ready!")
        await bot.login(process.env.BOT_TOKEN);
    }
}

export default Bot;

