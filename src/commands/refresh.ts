import { ChatInputCommand, Command } from '@sapphire/framework';
import { Watcher } from '../logging/watcher';

/**
 * Command: /refresh
 * Purpose: In case of multiple EVE LOGS categories, use this command.
 */
export class RefreshCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {...options});
    }

    public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName('refresh')
                .setDescription('Refresh the channels.')
        );
    }

    public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        await interaction.deferReply()

        await Watcher.RefreshLogChannels(process.env.GUILD_ID!);

        await interaction.deleteReply()
    }
}