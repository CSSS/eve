import { ChatInputCommand, Command } from '@sapphire/framework';
import { CategoryChannel, ChannelType } from 'discord.js';
import Bot from '../botClient';
import { Watcher } from '../logging/watcher';

// DELETE CHANNELS: delete "EVE LOGS" and all its child channels
export class RefreshCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {...options});
    }

    public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
        registry.registerChatInputCommand(builder =>
            builder
                .setName('delete')
                .setDescription('Delete the channels.')
        );
    }

    public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        await interaction.deferReply()

        // 1. Get guild object from the bot.
        const guild = await Bot.Client.guilds.fetch(process.env.GUILD_ID!);

        // 2. Get all channels that's named "EVE LOGS" and is a category.
        const categoryChannels = await guild.channels.fetch().then(cs => 
            Array.from(cs.values())
                .filter(_c => _c && _c.type === ChannelType.GuildCategory && _c.name === Watcher.categoryName)) as CategoryChannel[];

        // 3. Go through all Categories and delete all channels underneath each. 
        categoryChannels.forEach(_category => {
            const allChildren = Array.from(_category.children.valueOf().values());
            allChildren.forEach(_c => _c.delete().catch(_err => console.error(_err)))
            _category.delete().catch(_err => console.error(_err));
        });

        // 4. Secret command. Erase the calling message.
        await interaction.deleteReply()
    }
}