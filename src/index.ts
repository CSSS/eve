import { SapphireClient as Client } from "@sapphire/framework";
import { InspectOptions } from "util";
import winstonLogger from "./logger";

// var _log = console.log,
//     _warn = console.warn,
//     _error = console.error;

// console.log = function(args: any) {
//     logger.log('info', args)
//     _log(console, args);
// };

// console.warn = function(args: any) {
//     logger.log('warn', args)
//     _warn(console, args);
// };

// console.error = function() {
//     logger.log('error', arguments);
//     _error(console, arguments);
// };
// define a new console
const log = console.log;
const newConsole = {
    log: function(){
        const args = Array.from(arguments);
        // console.info(args);
        winstonLogger.log('info', args.join(' '));
        log.apply(console, args);
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

// Then redefine the old console
Object.assign(console, newConsole);

const bot = new Client({ intents: ['GUILDS', 'GUILD_MESSAGES'] })

bot.on('ready', () => {
    console.log("Hello")
    setTimeout(() => {
        console.log('info', "One second had passed")
    }, 1 * 1000);
});

bot.login('NjUwNTYxOTE0MTUzMzM2ODQy.GsUSNd.paC9UftntxboOCA63G0xtJBPLUK_yj7VVmbCKQ');