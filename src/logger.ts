import { createLogger, format as WinstonFormat, transports as WinstonTransports } from "winston";
import { FileTransportOptions } from "winston/lib/winston/transports";

// set up winston logger
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

export { winstonLogger, defaultWinstonInfoFileTransports };

