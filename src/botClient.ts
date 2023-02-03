import { SapphireClient as Client } from "@sapphire/framework";
const bot = new Client({ intents: ['GUILDS', 'GUILD_MESSAGES'] })

bot.on('ready', () => {
    console.log("Starting bot!!")
});

namespace Bot {
    export const Client = bot;
    export function Start() {
        bot.login('NjUwNTYxOTE0MTUzMzM2ODQy.GsUSNd.paC9UftntxboOCA63G0xtJBPLUK_yj7VVmbCKQ');
    }
}

export default Bot;

