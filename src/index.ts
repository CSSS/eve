import { start } from "./botClient";
import { defaultWinstonInfoFileTransports, winstonLogger } from "./logger";

// modify the global console
const log = console.log;
const newConsole = {
    log: function(){
        const args = Array.from(arguments);
        const customName = args.shift();
        if (args.length > 0) {
            console.info(`Logging with custom new name: ${customName}`)
            
            winstonLogger.configure({
                transports: defaultWinstonInfoFileTransports({ filename: `logs/${customName}.log` }),
            })
            winstonLogger.log('info', args.join(' '));
            log.apply(console, args);
        }
        else {
            console.info(`Returning to default transports`)
            
            winstonLogger.configure({
                transports: defaultWinstonInfoFileTransports()
            })
            winstonLogger.log('info', customName);
            log(customName);
        }
    },
};
Object.assign(console, newConsole);


start()