import { createLogger, format as WinstonFormat, transports as WinstonTransports } from "winston";
import { FileTransportOptions } from "winston/lib/winston/transports";
import {Watcher} from "./watcher";
import * as stream from "stream";
import {strftime} from "../strftime";
export let logsPath = "logs/";


export let loggerNameSuffixInfo = "-info";


export let loggerNameSuffixError = "-error";


export let logFileExtension = ".log";

export let process_time : String | null = null;

// set up winston logger
namespace WinstonLogger {
    const {combine, timestamp, printf} = WinstonFormat
    const myTimestamp = () => timestamp({format: 'YYYY-MM-DD HH:mm:ss'})
    const myFormat = printf((parms) => {
        return `[${parms.timestamp}] ${parms.level}: ${parms.message}`;
    });
    const defaultWinstonInfoFileTransports = (cmd: any = null, options: Partial<FileTransportOptions> = {}) => {
        return new WinstonTransports.File(Object.assign({
            filename: `${logsPath}${process_time}-${cmd}${loggerNameSuffixInfo}${logFileExtension}`,
            level: 'info',
            format: combine(myTimestamp(), myFormat)
        }, options))
    }
    const defaultWinstonErrorsFileTransports = (cmd : any= null, options: Partial<FileTransportOptions> = {}) => new WinstonTransports.File(Object.assign({
        filename: `${logsPath}${process_time}-${cmd}${loggerNameSuffixError}${logFileExtension}`,
        level: 'error',
        format: combine(myTimestamp(), myFormat)
    }, options))
    export const Initialise = async (cmd: string | null = null) => {
        if (process_time === null){
            process_time = strftime("%G-%m-%d_%I-%M-%S-%p", new Date())
        }
        if (cmd === null){
            cmd = "eve";
        }
        const winstonLogger = createLogger({
            transports: [
                defaultWinstonInfoFileTransports(cmd),
                defaultWinstonErrorsFileTransports(cmd),
            ]
        })
        if (cmd === "eve"){
            Object.assign(console,
                {
                    log: function (args: any) {
                        winstonLogger.info(args);
                    }
                    // modify the global console
                }
            );
            await Watcher.Add(cmd)
        } else {
            await Watcher.Add(cmd)
            return winstonLogger;
        }
    }
}

export default WinstonLogger;

