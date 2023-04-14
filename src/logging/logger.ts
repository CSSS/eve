import { Logger, format as WinstonFormat, transports as WinstonTransports, createLogger } from 'winston';
import { FileTransportOptions } from "winston/lib/winston/transports";
import { strftime } from "../strftime";
const {combine, timestamp, printf} = WinstonFormat

// set up winston logger
namespace WinstonLogger {
    // #region Constants that can be used by other modules.
    export const LOG_PATH = "logs/";
    export const LOG_SFX_INF = "-info";
    export const LOG_SFX_ERR = "-error";
    export const LOG_EXT = ".log";
    const DEFAULT_TS = () => timestamp({format: 'YYYY-MM-DD HH:mm:ss'})
        // default timestamp
    const DEFAULT_FORM = printf((parms) => `[${parms.timestamp}] ${parms.level}: ${parms.message}`);
        // default winston format
    // #endregion

    export let process_time : String | null = null;
    export let eve_logger: Logger | null = null;

    // info file transfer
    function DEFAULT_INFO_TSF (cmd: string = 'unknown', options: Partial<FileTransportOptions> = {})
        :WinstonTransports.FileTransportInstance {
        return new WinstonTransports.File(Object.assign({
            filename: `${LOG_PATH}${process_time}-${cmd}${LOG_SFX_INF}${LOG_EXT}`,
            level: 'info',
            format: combine(DEFAULT_TS(), DEFAULT_FORM)
        }, options))}
    // error file transfer
    function DEFAULT_ERR_TSF (cmd : string = 'unknown', options: Partial<FileTransportOptions> = {})
        :WinstonTransports.FileTransportInstance {
        return new WinstonTransports.File(Object.assign({
            filename: `${LOG_PATH}${process_time}-${cmd}${LOG_SFX_ERR}${LOG_EXT}`,
            level: 'error',
            format: combine(DEFAULT_TS(), DEFAULT_FORM)
        }, options))}

    export const Initialise = async (cmd: string = 'eve') => {
        console.info(`Initialising logger for ${cmd}...`)
        // 1. If process time is null, this is the first "Initialise" call.
        //  Modify global console in the first call.
        //  It will redirect any console calls to {cmd}_info / {cmd}_error logger
        if (process_time === null) {
            // 1.1 Set the "process time" to not-null.
            process_time = strftime("%G-%m-%d_%I-%M-%S-%p", new Date())

            // 1.2 Initialise eve logger. It will log every console.log in the file.
            eve_logger = await Initialise();
            
            // 1.3 make console.log call eve logger (Winston Logger) as well.
            const console_log = console.log;
            Object.assign(console, {
                log: function() {
                    const args = Array.from(arguments).map(a => a?.toString()).join(', ');
                    eve_logger?.info(args)
                    console_log(args);
                }
            })
        }

        // 2. Create logger using the file-transports.
        const winstonLogger = createLogger({
            transports: [
                DEFAULT_INFO_TSF(cmd),
                DEFAULT_ERR_TSF(cmd),
            ]
        });

        // 3. Customise the Winston Logger.
        //  Keep a reference of the original Winston logging function.
        const winstonInfo = winstonLogger.info;
        const winstonErr = winstonLogger.error;
        Object.assign(winstonLogger, {
            info: function() { // info logging, for when winstonLogger.info is called.
                // 3.1 Make an array of arguments (possibly converted to strings) and then join them together with commas.
                const args = Array.from(arguments).map(a => a?.toString()).join(', ');
                // 3.2 Pass that string through the logs methods.
                winstonInfo(args);
                console.info(args)
            },
            error: function() { // error logging, for when winstonLogger.error is called.
                const args = Array.from(arguments).map(a => a?.toString()).join(', ');
                winstonErr(args);
                console.error(args)
            }
        })

        // 4. Done.
        console.info("Done.");
        return winstonLogger;
    }
}

export default WinstonLogger;

