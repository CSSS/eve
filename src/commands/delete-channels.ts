import { ChatInputCommand, Command } from '@sapphire/framework';
import { CategoryChannel, ChannelType } from 'discord.js';
import Bot from '../botClient';

export class RefreshCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {...options});
    }

    public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName('delete')
                .setDescription('Delete the channels.')
        );
    }

    public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        await interaction.deferReply()

        const guild = await Bot.Client.guilds.fetch(process.env.GUILD_ID!);

        const categoryChannels = Array.from(guild.channels.cache.filter(_c => _c.type === ChannelType.GuildCategory && _c.name === "EVE LOGS").values()) as CategoryChannel[];
        categoryChannels.forEach(_cc => {
            const allchildren = Array.from(_cc.children.valueOf().values());
            allchildren.forEach(_c => _c.delete().catch(_err => console.error(_err)))
            if (_cc.deletable) _cc.delete().catch(_err => console.error(_err));
        });

        await interaction.deleteReply()
    }
}