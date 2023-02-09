import Discord, { ChannelType } from 'discord.js';
import fs from 'fs';
import path from 'path';
import Bot from './botClient';

const logsPath = '../logs/'

class Watcher {
    private static instance: Watcher;

    private static Instantiate() {
        Watcher.instance = new Watcher();
    }

    public static async RefreshLogChannels(guildID: string) {
        const guild = this.instance.guildCache[guildID] || await Bot.Client.guilds.fetch(guildID);
        this.instance.guildCache[guildID] = guild;

        const categoryChannels = Array.from(guild.channels.cache.filter(_c => _c.type === ChannelType.GuildCategory && _c.name === "EVE LOGS").values()) as Discord.CategoryChannel[];
        if (categoryChannels.length > 1) {
            const chosenCat = categoryChannels.shift()!;
            categoryChannels.forEach(_cc => {
                const allchildren = Array.from(_cc.children.valueOf().values());
                allchildren.forEach(_c => {
                    _c.setParent(chosenCat);
                });
                if (_cc.deletable) _cc.delete().catch(_err => console.error);
            });
        }
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
                    channel.send(buffer.toString('utf8', 0, num));
                });
            });
        });
        this.instance.FSwatchers.push(fswatcher);
    }

    public static async Add(commandName: string, guildID: string) {
        if (Watcher.instance == undefined) {
            Watcher.Instantiate();
        }

        // get guild
        const guild = this.instance.guildCache[guildID] || await Bot.Client.guilds.fetch(guildID);
        this.instance.guildCache[guildID] = guild;
        
        // get category
        await this.RefreshLogChannels(guildID);
        let category = this.instance.categoryCache[guildID] || guild.channels.cache.find(_c => _c.type === ChannelType.GuildCategory && _c.name === 'EVE LOGS');
        if (!(category && category instanceof Discord.CategoryChannel && category.deletable === true)) {
            category = await guild.channels.create({ name: "EVE LOGS", type: ChannelType.GuildCategory });
        }

        // get channel
        let channel = this.instance.channelCache[guildID+commandName] || guild.channels.cache.find(_c => _c.name == commandName);
        if (!(channel && channel instanceof Discord.TextChannel && channel.deletable === true)) {
            console.info(`channel "${commandName}" does not exist or is not a textchannel`)
            channel = await guild.channels.create({
                name: commandName,
                type: ChannelType.GuildText
            });
        }

        // set channel's parent to category
        channel.setParent(category);

        // assign watcher
        const relativePath = path.resolve(`${__dirname}\\${logsPath}\\${commandName}.log`);
        this.AddWatcher(relativePath, channel);
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

export default Watcher;