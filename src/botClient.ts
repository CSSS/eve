import { SapphireClient as Client } from "@sapphire/framework";
const bot = new Client({ intents: ['GUILDS', 'GUILD_MESSAGES'] })

bot.on('ready', () => {
    console.log('info', "Hello")
    setTimeout(() => {
        console.log('info2', "One second had passed")
    }, 1 * 1000);
});

function start() {
    bot.login('NjUwNTYxOTE0MTUzMzM2ODQy.GsUSNd.paC9UftntxboOCA63G0xtJBPLUK_yj7VVmbCKQ');
}

export { start, bot };