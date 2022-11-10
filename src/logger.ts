import { createLogger, transports, format } from "winston";

const logger = createLogger({
    transports: [
        new transports.File({
            filename: 'custom.log',
            level: 'info',
            format: format.combine(format.timestamp(), format.json())
        }),
        new transports.File({
            filename: 'custom.error',
            level: 'error',
            format: format.combine(format.timestamp(), format.json())
        }),
    ]
})

export default logger;