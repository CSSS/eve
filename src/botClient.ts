import { SapphireClient as Client } from "@sapphire/framework";
import { GatewayIntentBits } from "discord.js";
import WinstonLogger from "./logging/logger";
const bot = new Client({ intents: [
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.Guilds
    ] })

bot.on('ready', () => {
    console.log("Starting bot!!")
});

namespace Bot {
    export const Client = bot;
    export async function Start() {
        await bot.login(process.env.BOT_TOKEN);
        await WinstonLogger.Initialise()

    }
    export function GetUser(id: string) {
        return bot.users.fetch(id);
    }
}

export default Bot;

