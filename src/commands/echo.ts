import {
	ApplicationCommandRegistry,
	ApplicationCommandRegistryRegisterOptions,
	Command,
	RegisterBehavior
} from "@sapphire/framework";
import { EmbedBuilder } from "discord.js";
import { Logger } from "winston";
import {EveLogger} from "../logging/logInitializer";
import { EveLogUploader } from "../logging/logUploader";

/**
 * Command: /echo [message]
 * Purpose: The bot repeats what the user says in a beautiful embed.
 */
export class EchoCommand extends Command {
	private logger?: Logger;
    public constructor (context: Command.Context, options: Command.Options) {
        super(context, {...options})
    }

    public override async registerApplicationCommands(registry: ApplicationCommandRegistry) {
		// this.logger is a customised Winston Logger. It logs onto the console and onto Winston (file system) at the same time.
		this.logger = (new EveLogger('echo')).cmd_logger;

		// Watcher doesn't need a reference. It simply looks for a file related to the command name ('echo').
		let watcher = new EveLogUploader();
		await watcher.setupCategoryAndLogChannels(this.logger, 'echo');
		watcher.UploadLogsToDiscord();
		let opt  : ApplicationCommandRegistryRegisterOptions = new class implements ApplicationCommandRegistry.RegisterOptions {
			behaviorWhenNotIdentical: Exclude<RegisterBehavior, RegisterBehavior.BulkOverwrite>;
			guildIds: string[];
			idHints: string[];
			registerCommandIfMissing: boolean;
		}
		opt.guildIds = [process.env.GUILD_ID]
		registry.registerChatInputCommand(builder => {
			builder
				.setName("echo")
				.setDescription("Let the bot speak what you dare not.")
				.addStringOption(option =>
					option // param 1: the string message to be sent (required)
						.setName("message")
						.setDescription("anything, really")
						.setRequired(true))
		}, opt)
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		// 1. Set author and message. Makes the data more clear to the EmbedBuilder.
		// 	EmbedBuilder requires "name" and "icon_url" properties, which are both inconsistent in interaction.user.
		const author = Object.assign(interaction.user, {
			name: interaction.user.username,
			icon_url: interaction.user.avatarURL() || undefined
		});
		const message = interaction.options.data
			.map(_ => typeof(_.value) === 'string' ? _.value : "")
			.join("");
		
		// 2. RunID is the string tagged to the beginning of the console message.
		//	Notify the logger someone's called the echo command.
		const runID = `[EchoCommand ChatInputRun #${interaction.id}]`;
		this.logger?.info(`${runID} ${interaction.user.username} echoed: "${message}"`)
		
		// 3. Send embed.
		return interaction.reply({
			embeds: [
				new EmbedBuilder({
					author: author,
					description: message,
				})
			]
		})
	}
}