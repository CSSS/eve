import Winston from "winston";
import { start } from "./botClient";
import { defaultWinstonInfoFileTransports, winstonLogger } from "./logger";
const WinstonTransports = Winston.transports;
const WinstonFormat = Winston.format;
const myTimestamp = () => WinstonFormat.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })
const myFormat = WinstonFormat.printf((parms) => {
    return `[${parms.timestamp}] ${parms.level}: ${parms.message}`;
});

const log = console.log;
const newConsole = {
    log: function(){
        const args = Array.from(arguments);
        const customName = args.shift();
        if (args.length > 0) {
            console.info(`Logging with custom new name: ${customName}`)
            
            winstonLogger.configure({
                transports: defaultWinstonInfoFileTransports({ filename: `${customName}.log` }),
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