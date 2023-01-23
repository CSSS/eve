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
};
Object.assign(console, newConsole);
start()