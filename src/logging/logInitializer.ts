import {format as WinstonFormat, transports as WinstonTransports, createLogger} from 'winston';
const {combine, printf} = WinstonFormat
import { FileTransportOptions } from "winston/lib/winston/transports";
import { strftime } from "../utilities/strftime";
import {Logger} from "winston";


// set up winston logger
export class EveLogger {

    static LOG_PATH = "logs/";
    static LOG_SFX_INF = "-info";
    static LOG_SFX_ERR = "-error";
    static LOG_EXT = ".log";

    cmd_logger: Logger;

    static boot_time: String | null = null;

    /**
     * Setups the WinstonTransport for outputting to the info file
     * @param cmd - the command that the file is for
     * @param options
     * @constructor
     * @private
     */
    private DEFAULT_INFO_TSF(cmd: string = 'unknown', options: Partial<FileTransportOptions> = {}): WinstonTransports.FileTransportInstance {
        return new WinstonTransports.File(Object.assign({
            filename: `${EveLogger.LOG_PATH}${EveLogger.boot_time}-${cmd}${EveLogger.LOG_SFX_INF}${EveLogger.LOG_EXT}`,
            level: 'info',
            format: combine(printf(params => params.message)),
        }, options))
    }

    /**
     * Setups the WinstonTransport for outputting the error file
     * @param cmd - the command that the file is for
     * @param options
     * @constructor
     * @private
     */
    private DEFAULT_ERR_TSF(cmd: string = 'unknown', options: Partial<FileTransportOptions> = {}): WinstonTransports.FileTransportInstance {
        return new WinstonTransports.File(Object.assign({
            filename: `${EveLogger.LOG_PATH}${EveLogger.boot_time}-${cmd}${EveLogger.LOG_SFX_ERR}${EveLogger.LOG_EXT}`,
            level: 'error',
            format: combine(printf(params => params.message)),
        }, options))
    }

    public static getTimeStamp = strftime("%G-%m-%d %I:%M:%S", new Date())

    /**
     * setups the formatting for the log entry
     * @param level - the level of the log file
     * @param cmd - the command that the log entry is for
     * @param messages - the message itself
     * @private
     */
    private static messageFormatter(level: string, cmd: string, messages: any) {return `${EveLogger.getTimeStamp} = ${level} = ${cmd} = ${messages}\n`;}


    /**
     * Sets up the logger for the specified command [and optionally redirect console.log to winston logger if the command being setup is eve]
     * @param cmd_name - the command the log is being setup for
     */
    public constructor(cmd_name: string = 'eve') {
        // 1. If process time is null, this is the first "Initialise" call.
        //  Modify global console in the first call.
        //  It will redirect any console calls to {cmd_name}_info / {cmd_name}_error logger
        if (EveLogger.boot_time === null) {
            // 1.1 Set the "process time" to not-null.
            EveLogger.boot_time = EveLogger.getTimeStamp
        }

        console.info(`Initialising logger for ${cmd_name}...`)
        // 2. Create logger using the file-transports.
        this.cmd_logger = createLogger({
            transports: [
                this.DEFAULT_INFO_TSF(cmd_name),
                this.DEFAULT_ERR_TSF(cmd_name),
            ]
        });

        // 3. Customise the Winston Logger.
        const original_winston_debug = this.cmd_logger.debug;
        const original_winston_error = this.cmd_logger.error;
        const original_winston_info = this.cmd_logger.info;
        const original_winston_warn = this.cmd_logger.warn;

        let formatter = EveLogger.messageFormatter;
        let winstonLogger = this.cmd_logger;
        this.cmd_logger.debug = function (messages: any) {
            // default timestamp
            const message = formatter("DEBUG", cmd_name, messages)
            process.stdout.write(message);
            original_winston_debug(message);
            return winstonLogger;
        }
        this.cmd_logger.info = function (messages: any) {
            // default timestamp
            const message = formatter("INFO", cmd_name, messages)
            process.stdout.write(message);
            original_winston_info(message);
            return winstonLogger;
        }
        this.cmd_logger.warn = function (messages: any) {
            // default timestamp
            const message = formatter("WARN", cmd_name, messages)
            process.stderr.write(message);
            original_winston_warn(message);
            return winstonLogger;
        }
        this.cmd_logger.error = function (messages: any) {
            // default timestamp
            const message = formatter("ERROR", cmd_name, messages)
            process.stderr.write(message);
            original_winston_error(message);
            return winstonLogger;
        }
        if (cmd_name === 'eve') {
            console.log = function (message?: any, ...optionalParams: any[]) {
                EveLogger.create_message_lines(message, optionalParams).forEach(message => {
                    winstonLogger.info(message)
                });
            };
            console.debug = function (message?: any, ...optionalParams: any[]) {
                EveLogger.create_message_lines(message, optionalParams).forEach(message => {
                    winstonLogger.debug(message)
                });
            };
            console.info = function (message?: any, ...optionalParams: any[]) {
                EveLogger.create_message_lines(message, optionalParams).forEach(message => {
                    winstonLogger.info(message)
                });
            };
            console.warn = function (message?: any, ...optionalParams: any[]) {
                EveLogger.create_message_lines(message, optionalParams).forEach(message => {
                    winstonLogger.warn(message)
                });
            };
            console.error = function (message?: any, ...optionalParams: any[]) {
                EveLogger.create_message_lines(message, optionalParams).forEach(message => {
                    winstonLogger.error(message)
                });
            };
        }
    }

    /**
     * goes through all the strings passed to the console methods to construct them into 1 singular array and then
     * pass that back to the winston logger to ensure stack traces also get captured
     * @param message -- the message object from the console methods
     * @param optionalParams - the param that seems to contain the stack traces
     * @private
     * @return messages -- the singular array that contains all the messages that need to be printed out
     */
    private static create_message_lines(message?: any, ...optionalParams: any[]){
        let messages = [message]
        for (let i = 0; i < optionalParams.length; i++){
            const stack_trace_exists = optionalParams.length >= (i+1) && optionalParams[i].length > 0 && optionalParams[i][0].stack !== undefined
            const optionalParam = (stack_trace_exists) ? optionalParams[i][0].stack.split("\n") : [optionalParams[i]] ;
            for (let j = 0; j < optionalParam.length; j++){
                if (optionalParam[j].length > 0) {
                    messages.push(optionalParam[j]);
                }
            }
        }
        return messages;
    }



}
