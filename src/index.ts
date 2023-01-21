import { start } from "./botClient";
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
start()