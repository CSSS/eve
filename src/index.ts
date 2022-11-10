import { SapphireClient as Client } from "@sapphire/framework";
import logger from "./logger";

const bot = new Client({ intents: ['GUILDS', 'GUILD_MESSAGES'] })

bot.on('ready', () => {
    console.log("Hello")
    logger.log('info', "Bot is ready.")
    setTimeout(() => {
        logger.log('info', "One second had passed")
    }, 1 * 1000);
});

bot.login('NjUwNTYxOTE0MTUzMzM2ODQy.GsUSNd.paC9UftntxboOCA63G0xtJBPLUK_yj7VVmbCKQ');