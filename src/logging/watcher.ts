// @ts-ignore
import Discord, { ChannelType } from 'discord.js';
// @ts-ignore
import fs from 'fs';
// @ts-ignore
import path from 'path';
import Bot from '../botClient';

import {logFileExtension, loggerNameSuffixError, loggerNameSuffixInfo, logsPath} from "./logger";

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


    public static async Add(commandName: string | null = null) {
        if (commandName === null){
            commandName = 'eve';
        }
        this.instance = new Watcher();

        // get guild
        console.log(process.env.BOT_TOKEN)
        this.instance.guildCache[process.env.GUILD_ID!] = await Bot.Client.guilds.fetch(process.env.GUILD_ID!);

        // get category
        await this.RefreshLogChannels(process.env.GUILD_ID!);
        let category = this.instance.categoryCache[process.env.GUILD_ID!] || this.instance.guildCache[process.env.GUILD_ID!].channels.cache.find((_c: { type: ChannelType; name: string; }) => _c.type === ChannelType.GuildCategory && _c.name === 'EVE LOGS');
        if (category && category instanceof Discord.CategoryChannel) {
            console.info(`${commandName}: category exists`)
        }
        else {
            console.info(`${commandName}: category doesn't exist yet. creating...`)
            category = await this.instance.guildCache[process.env.GUILD_ID!].channels.create({ name: "EVE LOGS", type: ChannelType.GuildCategory });
        }
        this.instance.categoryCache[process.env.GUILD_ID!] = category


        const info_channel_name = `${commandName}${loggerNameSuffixInfo}`

        // get channel
        let info_channel = this.instance.channelCache[process.env.GUILD_ID+info_channel_name] || this.instance.guildCache[process.env.GUILD_ID!].channels.cache.find((_c: { name: string; }) => _c.name == info_channel_name);
        if (info_channel && info_channel instanceof Discord.TextChannel) {
            console.info(`${info_channel_name}: channel exists already.`)
        }
        else {
            console.info(`${commandName}: channel "${info_channel_name}" does not exist or is not a textchannel`)
            info_channel = await this.instance.guildCache[process.env.GUILD_ID!].channels.create({
                name: info_channel_name,
                type: ChannelType.GuildText
            });
            this.instance.channelCache[this.instance.guildCache[process.env.GUILD_ID!]+commandName] = info_channel;
        }

        const error_channel_name = `${commandName}${loggerNameSuffixError}`

        let error_channel = this.instance.channelCache[process.env.GUILD_ID+error_channel_name] || this.instance.guildCache[process.env.GUILD_ID!].channels.cache.find((_c: { name: string; }) => _c.name == error_channel_name);
        if (error_channel && error_channel instanceof Discord.TextChannel) {
            console.info(`${commandName}: channel exists already.`)
        }
        else {
            console.info(`${commandName}: channel "${error_channel_name}" does not exist or is not a textchannel`)
            error_channel = await this.instance.guildCache[process.env.GUILD_ID!].channels.create({
                name: error_channel_name,
                type: ChannelType.GuildText
            });
            this.instance.channelCache[await this.instance.guildCache[process.env.GUILD_ID!]+commandName] = error_channel;
        }

        // set channel's parent to category
        console.log(`setting category for ${error_channel_name} to ${category.name}`)
        error_channel.setParent(category);
        console.log(`setting category for ${info_channel_name} to ${category.name}`)
        info_channel.setParent(category);

        // assign watcher
        this.AddWatcher(path.resolve(`${logsPath}${commandName}${loggerNameSuffixError}${logFileExtension}`), error_channel);
        this.AddWatcher(path.resolve(`${logsPath}${commandName}${loggerNameSuffixInfo}${logFileExtension}`), info_channel);
    }

    public static AddWatcher(relativePath: fs.PathLike, channel: Discord.TextChannel) {
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
                    if (msgString.length > 0) {
                        channel.send(msgString);
                    }
                });
            });
        });
        this.instance.FSwatchers.push(fswatcher);
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