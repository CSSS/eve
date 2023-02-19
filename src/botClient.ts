import { SapphireClient as Client } from "@sapphire/framework";
import { GatewayIntentBits } from "discord.js";

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
    export function Start() {
        bot.login(process.env.TOKEN_ID);
    }
    export function GetUser(id: string) {
        return bot.users.fetch(id);
    }
}

export default Bot;

