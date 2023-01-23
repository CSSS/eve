import { createLogger, format, transports } from "winston";
import { FileTransportOptions } from "winston/lib/winston/transports";
const { combine, timestamp, printf } = format

const myTimestamp = () => timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })
const myFormat = printf((parms) => {
    return `[${parms.timestamp}] ${parms.level}: ${parms.message}`;
});

const defaultWinstonInfoFileTransports = (options: Partial<FileTransportOptions> = {}) => new transports.File(Object.assign({
    filename: 'logs/custom.log',
    level: 'info',
    format: combine(myTimestamp(), myFormat)
}, options))
const defaultWinstonErrorsFileTransports = (options: Partial<FileTransportOptions> = {}) => new transports.File(Object.assign({
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

export { defaultWinstonErrorsFileTransports, defaultWinstonInfoFileTransports, winstonLogger };

