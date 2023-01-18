import { createLogger, transports, format } from "winston";
const { combine, timestamp, printf } = format

const myTimestamp = () => timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })
const myFormat = printf((parms) => {
    return `[${parms.timestamp}] ${parms.level}: ${parms.message}`;
});


const winstonLogger = createLogger({
    transports: [
        new transports.File({
            filename: 'custom.log',
            level: 'info',
            format: combine(myTimestamp(), myFormat)
        }),
        new transports.File({
            filename: 'errors.log',
            level: 'error',
            format: combine(myTimestamp(), myFormat)
        }),
    ]
})

export default winstonLogger;