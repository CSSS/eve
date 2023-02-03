import { createLogger, format as WinstonFormat, transports as WinstonTransports } from "winston";
import { FileTransportOptions } from "winston/lib/winston/transports";

// set up winston logger
namespace WinstonLogger {
    const { combine, timestamp, printf } = WinstonFormat
    const myTimestamp = () => timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })
    const myFormat = printf((parms) => {
        return `[${parms.timestamp}] ${parms.level}: ${parms.message}`;
    });
    const defaultWinstonInfoFileTransports = (options: Partial<FileTransportOptions> = {}) => new WinstonTransports.File(Object.assign({
        filename: 'logs/custom.log',
        level: 'info',
        format: combine(myTimestamp(), myFormat)
    }, options))
    const defaultWinstonErrorsFileTransports = (options: Partial<FileTransportOptions> = {}) => new WinstonTransports.File(Object.assign({
        filename: 'logs/errors.log',
        level: 'error',
        format: combine(myTimestamp(), myFormat)
    }, options))
    const winstonLogger = createLogger({
        transports: [
            defaultWinstonInfoFileTransports(),
            defaultWinstonErrorsFileTransports(),
        ]
    })
    export const Initialise = () => {
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
    }
}

export default WinstonLogger;

