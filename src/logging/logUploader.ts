import { CategoryChannelResolvable, Guild, TextChannel } from 'discord.js';
import {ChannelType } from 'discord-api-types/v10';
import fs from 'fs';
import path from 'path';
import { Logger } from "winston";
import { Bot } from '../index';
import { EveLogger } from './logInitializer';

export class EveLogUploader {
    public static categoryName: string = "EVE LOGS";
    private cmd_logger: Logger;
    private commandName: string;

    private log_info_channel: TextChannel;
    private log_error_channel: TextChannel;
    private log_error_file_path: fs.PathLike;
    private log_info_file_path: fs.PathLike;

    /**
     * setups the necessary categories and logs for the specified command
     * @param logger - the command's logger
     * @param commandName - command's name
     */
    async setupCategoryAndLogChannels(logger: Logger, commandName: string = 'eve') {
        this.commandName = commandName;


        const channelPositionMapping = {
            'eve-info': 0,
            'eve-error': 1,
            'ping-info': 2,
            'ping-error': 3,
            'echo-info': 4,
            'echo-error': 5,
            'iam-info': 6,
            'iam-error': 7
        }
        this.cmd_logger = logger;
        this.cmd_logger.info(`Applying watcher to ${commandName}...`);


        // creating the info channel
        const info_channel_name: string = `${commandName}${EveLogger.LOG_SFX_INF}`
        const error_channel_name: string = `${commandName}${EveLogger.LOG_SFX_ERR}`
        if (channelPositionMapping[info_channel_name] === undefined) {
            console.error(`no channel position mapping found for ${info_channel_name}`);
            process.exit(1);
        }
        if (channelPositionMapping[error_channel_name] === undefined) {
            console.error(`no channel position mapping found for ${error_channel_name}`);
            process.exit(1);
        }

        const guild: Guild = await Bot.Client.guilds.fetch(process.env.GUILD_ID!);
        const category: CategoryChannelResolvable = await this.getCategory(guild);
        this.log_info_channel = await this.getLogUploadChannel(
            guild, info_channel_name, category, channelPositionMapping[info_channel_name]
        );
        this.log_error_channel = await this.getLogUploadChannel(
            guild, error_channel_name, category, channelPositionMapping[error_channel_name]
        );

        this.log_error_file_path = path.resolve(
            `${EveLogger.LOG_PATH}${EveLogger.boot_time}-${commandName}${EveLogger.LOG_SFX_ERR}${EveLogger.LOG_EXT}`
        )
        this.log_info_file_path = path.resolve(
            `${EveLogger.LOG_PATH}${EveLogger.boot_time}-${commandName}${EveLogger.LOG_SFX_INF}${EveLogger.LOG_EXT}`
        )
        this.cmd_logger.info(`Watcher added for [${commandName}].`)
    }

    /**
     * acquire the category for the text channels.
     * @param guild - the Guild object
     * @private
     * @return category -- the category obj
     */
    private async getCategory(guild: Guild) {
        let category: CategoryChannelResolvable;
        while (!category) {
            await guild.fetch();
            category = guild.channels.cache.find(
                (_c: {
                    type: ChannelType;
                    name: string;
                }) => _c.type === ChannelType.GuildCategory && _c.name === EveLogUploader.categoryName
            )?.id;
            if (category) {
                this.cmd_logger.info(`${EveLogUploader.categoryName}: category exists`)
            } else if (this.commandName === 'eve') {
                this.cmd_logger.info(`${EveLogUploader.categoryName}: category doesn't exist yet. creating...`)
                category = await guild.channels.create({
                    name: EveLogUploader.categoryName,
                    type: ChannelType.GuildCategory
                });
            } else {
                this.cmd_logger.info("waiting for EVE to create the category")
            }
        }
        return category;
    }

    /**
     * setups up and returns the discord guild channel that wil be used for the log uploading
     * @param guild - the Guild object
     * @param channel_name - the name to set the channel to
     * @param category - the category the channel has to go under
     * @param channelCategoryPosition - the position of the channel under the category
     * @private
     */
    private async getLogUploadChannel(guild: Guild, channel_name: string, category: CategoryChannelResolvable, channelCategoryPosition: number) {
        let log_info_channel = guild.channels.cache.find(
            _c => _c.name == channel_name
        ) as TextChannel;
        if (log_info_channel) {
            this.cmd_logger.info(`${this.commandName}: ${channel_name}: channel exists already.`)
        } else {
            this.cmd_logger.info(`${this.commandName}: channel "${channel_name}" does not exist or is not a textchannel`)
            log_info_channel = await guild.channels.create({
                name: channel_name,
                type: ChannelType.GuildText,
                parent: category,
                position: channelCategoryPosition
            });
        }
        return log_info_channel;
    }

    /**
     * reads the current contents of the info and error files to the discord channels and sets up the log file watchers
     * to make sure future entries also get uploaded to the discord channels
     * @constructor
     */
    public UploadLogsToDiscord() {
        this.setupLogFileWatcher(this.log_info_file_path, this.log_info_channel);
        this.setupLogFileWatcher(this.log_error_file_path, this.log_error_channel);
    }


    /**
     * reads the current contents of the specified file to the specified discord channel and sets up a log file watcher
     * to make sure future entries also get uploaded to the discord channels
     * @param log_file_path
     * @param log_channel
     * @private
     */
    private setupLogFileWatcher(log_file_path: fs.PathLike, log_channel: TextChannel) {
        this.cmd_logger.info(`starting to watch file ${log_file_path}...`);

        /*
        as I cannot find a way to mimic what wall_e is doing [open a log file once, read from the beginning and
        periodically check the entries as more time passes to upload any new log entries, I have had to do a wierd
        alternative with nodejs:
        the first block of code for fs.readFile is intended to read from the beginning of the
        file up until the last line it can fine before moving onto the next block of code which is when
        fs.watchFile will kick in, and that sets a watcher on the file that watches for any modifications to the file
        and uploads those new entries to discord.

        BUG: this has the unfortunate side effect of if watchFile is called fast enough, it will print out lines that
        BUG: were already printed out by the earlier readFile callback function
         */
        const local_log_file_path: fs.PathLike = log_file_path;
        let local_log_channel: TextChannel = log_channel;
        fs.readFile(local_log_file_path, async function (err, data) {
            const message = data?.toString();
            if (message?.length > 0) {
                const lines = message.split("\n")
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].length > 0) {
                        await local_log_channel.send(lines[i]);
                    }
                }
            }
        })
        // watch for file change
        fs.watchFile(local_log_file_path, async (_cur, _prev) => {

            // each time the file is changed, open the file and read its contents
            fs.open(local_log_file_path, 'r', (status, fd) => {
                if (status) {
                    this.cmd_logger.info(status.message);
                    return;
                }

                // diff == byte differences when file is changed
                var diff = _cur.size - _prev.size;

                // read the opened file by {diff} bytes
                var buffer = Buffer.alloc(diff);
                fs.read(fd, buffer, 0, diff, _prev.size, (err, num) => {
                    if (err) {
                        this.cmd_logger.error(err);
                        return;
                    }

                    // send the read bytes in string format in discord channel
                    const msgString = buffer.toString('utf8', 0, num);
                    for (const line of msgString.split(/[\r\n]+/)) {
                        if (line.length > 0) {
                            local_log_channel.send(line);
                        }
                    }
                });
            });
        });
    }
}