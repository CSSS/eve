// @ts-ignore
import Discord, { CategoryChannel, ChannelType } from 'discord.js';
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
        // 1. Get guild either from cache or directly from the bot.
        const guild = this.instance.guildCache[guildID] || await Bot.Client.guilds.fetch(guildID);
        
        // 2. Make sure guild is valid.
        const valid = Bot?.Client.id && (await guild.members.fetch())?.has(Bot.Client.id);
        if (!valid) {
            // 2.a. Bot is not initialised (how?) or guild kicked our bot out. This doesn't concern the bot anymore.
            return;
        }
        else {
            // 2.b. Save the guild in cache.
            this.instance.guildCache[guildID] = guild;
        }

        // 3. Get all categories that are named "EVE LOGS".
        const categoryChannels = await guild.channels.fetch().then(cs => 
            Array.from(cs.values())
                .filter(_c => _c && _c.type === ChannelType.GuildCategory && _c.name === "EVE LOGS")) as CategoryChannel[];

        // 4. If there are more than one EVE LOGS,
        if (categoryChannels.length > 1) {
            // 4.a. There shouldn't be more than one EVE LOGS category.
            // 4.a.1. Select one of them to be the only category channel.
            const chosenCat = categoryChannels.shift()!;

            // 4.a.2. Go through all other categories.
            categoryChannels.forEach(_cc => {
                // 4.a.2.1. Get all child channels into one array, then set their parents to be the chosen category channel.
                const allChildren = Array.from(_cc.children.valueOf().values());
                allChildren.forEach(_c => {
                    // @ts-ignore
                    _c.setParent(chosenCat);
                });
                
                // 4.a.2.2. And then we delete the extra categories.
                if (_cc.deletable) _cc.delete().catch((_err: any) => console.error);
            });
        }
        else if (categoryChannels.length === 0) {
            // 4.b. There should be at least one EVE LOGS category.
            await guild.channels.create({
                type: ChannelType.GuildCategory,
                name: "EVE LOGS"
            })
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