// @ts-ignore
import Discord, { ChannelType } from 'discord.js';
// @ts-ignore
import fs from 'fs';
// @ts-ignore
import path from 'path';
import Bot from '../botClient';
import WinstonLogger from './logger';
let { LOG_EXT, LOG_PATH, LOG_SFX_ERR, LOG_SFX_INF } = WinstonLogger;

export class Watcher {
    private static instance: Watcher;

    public static async RefreshLogChannels(guildID: string) {
        const guild = this.instance.guildCache[guildID] || await Bot.Client.guilds.fetch(guildID);
        this.instance.guildCache[guildID] = guild;

        const categoryChannels = Array.from(guild.channels.cache.filter((_c: { type: ChannelType; name: string; }) => _c.type === ChannelType.GuildCategory && _c.name === "EVE LOGS").values()) as Discord.CategoryChannel[];
        if (categoryChannels.length > 1) {
            const chosenCat = categoryChannels.shift()!;
            categoryChannels.forEach(_cc => {
                const allchildren = Array.from(_cc.children.valueOf().values());
                allchildren.forEach(_c => {
                    // @ts-ignore
                    _c.setParent(chosenCat);
                });
                if (_cc.deletable) _cc.delete().catch((_err: any) => console.error);
            });
        }
        else if (categoryChannels.length === 0) {
            
        }
    }

    public static async Add(commandName: string = 'eve') {
        console.info(`Applying watcher to ${commandName}...`);
        if (this.instance === undefined) {
            this.instance = new Watcher();
        }

        // get guild
        if (!this.instance.guildCache[process.env.GUILD_ID!]) {
            this.instance.guildCache[process.env.GUILD_ID!] = await Bot.Client.guilds.fetch(process.env.GUILD_ID!);
        }
        const guild = this.instance.guildCache[process.env.GUILD_ID!];

        // get category
        await this.RefreshLogChannels(process.env.GUILD_ID!);
        let category = this.instance.categoryCache[process.env.GUILD_ID!] || guild.channels.cache.find((_c: { type: ChannelType; name: string; }) => _c.type === ChannelType.GuildCategory && _c.name === 'EVE LOGS');
        if (category && category instanceof Discord.CategoryChannel) {
            console.info(`${commandName}: category exists`)
        }
        else {
            console.info(`${commandName}: category doesn't exist yet. creating...`)
            category = await guild.channels.create({ name: "EVE LOGS", type: ChannelType.GuildCategory });
        }
        this.instance.categoryCache[process.env.GUILD_ID!] = category

        // creating the info channel
        const info_channel_name = `${commandName}${LOG_SFX_INF}`
        let info_channel = this.instance.channelCache[process.env.GUILD_ID+info_channel_name] || guild.channels.cache.find((_c) => _c.name == info_channel_name);
        if (info_channel && info_channel instanceof Discord.TextChannel) {
            console.info(`${commandName}: ${info_channel_name}: channel exists already.`)
        }
        else {
            console.info(`${commandName}: channel "${info_channel_name}" does not exist or is not a textchannel`)
            info_channel = await guild.channels.create({
                name: info_channel_name,
                type: ChannelType.GuildText
            });
            this.instance.channelCache[guild+commandName] = info_channel;
        }

        // creating the error channel
        const error_channel_name = `${commandName}${LOG_SFX_ERR}`
        let error_channel = this.instance.channelCache[process.env.GUILD_ID+error_channel_name] || guild.channels.cache.find((_c) => _c.name == error_channel_name);
        if (error_channel && error_channel instanceof Discord.TextChannel) {
            console.info(`${commandName}: ${error_channel_name}: channel exists already.`)
        }
        else {
            console.info(`${commandName}: channel "${error_channel_name}" does not exist or is not a textchannel`)
            error_channel = await guild.channels.create({
                name: error_channel_name,
                type: ChannelType.GuildText
            });
            this.instance.channelCache[guild+commandName] = error_channel;
        }

        // set channel's parent to category
        console.log(`setting category for ${error_channel_name} to ${category.name}`)
        await error_channel.setParent(category);
        console.log(`setting category for ${info_channel_name} to ${category.name}`)
        await info_channel.setParent(category);

        // assign watcher
        this.instance.Add(path.resolve(`${LOG_PATH}${WinstonLogger.process_time}-${commandName}${LOG_SFX_ERR}${LOG_EXT}`), error_channel);
        this.instance.Add(path.resolve(`${LOG_PATH}${WinstonLogger.process_time}-${commandName}${LOG_SFX_INF}${LOG_EXT}`), info_channel);

        console.info(`Done [${commandName}].`)
    }

    private Add(relativePath: fs.PathLike, channel: Discord.TextChannel) {
        console.info(`\\=> ${relativePath}...`);

        // watch for file change
        const fswatcher = fs.watchFile(relativePath, async (_cur, _prev) => {

            // each time the file is changed, open the file and read its contents
            fs.open(relativePath, 'r', (status, fd) => {
                if (status) {
                    console.log(status.message);
                    return;
                }

                // diff == byte differences when file is changed
                var diff = _cur.size - _prev.size;

                // read the opened file by {diff} bytes
                var buffer = Buffer.alloc(diff);
                fs.read(fd, buffer, 0, diff, _prev.size, (err, num) => {
                    if (err) {
                        console.error(err);
                        return;
                    }

                    // send the read bytes in string format in discord channel
                    const msgString = buffer.toString('utf8', 0, num);
                    for (const line of msgString.split(/[\r\n]+/)){
                        if (line.length > 0){
                            channel.send(line);
                        }
                    }
                });
            });
        });
        this.FSwatchers.push(fswatcher);
    }

    private constructor() {
        this.FSwatchers = [];
        this.guildCache = {};
        this.channelCache = {};
        this.categoryCache = {};
    }

    private FSwatchers: fs.StatWatcher[];
    private guildCache: Record<string, Discord.Guild>;
    private channelCache: Record<string, Discord.TextChannel>;
    private categoryCache: Record<string, Discord.CategoryChannel>;
}