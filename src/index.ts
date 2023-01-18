import { SapphireClient as Client } from "@sapphire/framework";
import winstonLogger from "./logger";

const log = console.log;
const newConsole = {
    log: function(){
        const args = Array.from(arguments);
        const level = args.shift();
        if (args.length > 0) {
            winstonLogger.log(level, args.join(' '));
            log.apply(console, args);
        }
    },
    // info: function (text: string) {
    //     oldCons.info(text);
    //     // Your code
    // },
    // warn: function (text: string) {
    //     oldCons.warn(text);
    //     // Your code
    // },
    // error: function (text: string) {
    //     oldCons.error(text);
    //     // Your code
    // }
};
Object.assign(console, newConsole);

const bot = new Client({ intents: ['GUILDS', 'GUILD_MESSAGES'] })

bot.on('ready', () => {
    console.log('info', "Hello")
    setTimeout(() => {
        console.log('info2', "One second had passed")
    }, 1 * 1000);
});

bot.login('NjUwNTYxOTE0MTUzMzM2ODQy.GsUSNd.paC9UftntxboOCA63G0xtJBPLUK_yj7VVmbCKQ');