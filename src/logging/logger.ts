import { createLogger, format as WinstonFormat, Logger, transports as WinstonTransports } from 'winston';
import { FileTransportOptions } from "winston/lib/winston/transports";
import { strftime } from "../strftime";

// set up winston logger
namespace WinstonLogger {
    //#region CONST
    export const LOG_PATH = "logs/";
    export const LOG_SFX_INF = "-info";
    export const LOG_SFX_ERR = "-error";
    export const LOG_EXT = ".log";
    const {combine, timestamp, printf} = WinstonFormat
    const DEFAULT_TS = () => timestamp({format: 'YYYY-MM-DD HH:mm:ss'})
    const DEFAULT_FORM = printf((parms) => {
        return `[${parms.timestamp}] ${parms.level}: ${parms.message}`;
    });
    //#endregion

    export let process_time : String | null = null;
    export let eve_logger: Logger | null = null;
    const DEFAULT_INFO_TSF = (cmd: string = 'unknown', options: Partial<FileTransportOptions> = {}) => {
        return new WinstonTransports.File(Object.assign({
            filename: `${LOG_PATH}${process_time}-${cmd}${LOG_SFX_INF}${LOG_EXT}`,
            level: 'info',
            format: combine(DEFAULT_TS(), DEFAULT_FORM)
        }, options))
    }
    const DEFAULT_ERR_TSF = (cmd : string = 'unknown', options: Partial<FileTransportOptions> = {}) => new WinstonTransports.File(Object.assign({
        filename: `${LOG_PATH}${process_time}-${cmd}${LOG_SFX_ERR}${LOG_EXT}`,
        level: 'error',
        format: combine(DEFAULT_TS(), DEFAULT_FORM)
    }, options))

    export const Initialise = async (cmd: string = 'eve') => {
        console.info(`Initialising logger for ${cmd}...`)
        // if process time is null, this is the first initialise call.
        // modify global console in the first call. once is enough.
        // [modifying global console to redirect any console calls to eve_info / eve_error logger]
        if (process_time === null) {
            // set process time first to confirm the first stack of Initialise has already been called.
            process_time = strftime("%G-%m-%d_%I-%M-%S-%p", new Date())

            // initialise eve logger
            eve_logger = await Initialise();
            
            // make console.log call winston logger as well.
            const clog = console.log;
            Object.assign(console, {
                log: function() {
                    const args = Array.from(arguments).map(
                        a => a?.toString()
                    ).join(', ');
                    clog(args);
                    eve_logger?.info(args)
                }
            })

        }

        const winstonLogger = createLogger({
            transports: [
                DEFAULT_INFO_TSF(cmd),
                DEFAULT_ERR_TSF(cmd),
            ]
        });

        const winstonInfo = winstonLogger.info;
        const winstonErr = winstonLogger.error;

        console.info("Done.");
        return winstonLogger;
    }
}

export default WinstonLogger;

