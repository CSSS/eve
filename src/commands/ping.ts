import {
	ApplicationCommandRegistry,
	ApplicationCommandRegistryRegisterOptions,
	Command,
	RegisterBehavior
} from '@sapphire/framework';
import { EmbedBuilder, Message } from 'discord.js';
import { Logger } from 'winston';
import {EveLogger} from '../logging/logInitializer';
import { EveLogUploader } from '../logging/logUploader';


/**
 * Command: /ping
 * Purpose: Sends a "followUp" to the server and returning, calculating the difference in timestamp to get an estimate on ping.
 */
export class PingCommand extends Command {
	private logger?: Logger;
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, {...options});
	}

	public override async registerApplicationCommands(registry: ApplicationCommandRegistry) {
		// this.logger is a customised Winston Logger. It logs onto the console and onto Winston (file system) at the same time.
		this.logger = (new EveLogger('ping')).cmd_logger;

		// Watcher doesn't need a reference. It simply looks for a file related to the command name ('ping').
		let watcher = new EveLogUploader();
		await watcher.setupCategoryAndLogChannels(this.logger, 'ping');
		watcher.UploadLogsToDiscord();
		let opt  : ApplicationCommandRegistryRegisterOptions = new class implements ApplicationCommandRegistry.RegisterOptions {
			behaviorWhenNotIdentical: Exclude<RegisterBehavior, RegisterBehavior.BulkOverwrite>;
			guildIds: string[];
			idHints: string[];
			registerCommandIfMissing: boolean;
		}
		opt.guildIds = [process.env.GUILD_ID]
		registry.registerChatInputCommand((builder) =>
			builder
				.setName('ping')
				.setDescription('Ping bot to see if it is alive'), opt
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await interaction.deferReply(); // async command. Requires a defer in reply in case async takes too long.

		// 1. RunID is the string tagged to the beginning of the console message.
		const runID = `[PingCommand ChatInputRun #${interaction.id}]`;
		this.logger?.info(`${runID} Called from ${interaction.user.username}`)

		// 2. Send a loading embed, tell the user it's sending the ping. (usually only appears for a very short amount of time)
		const embed = new EmbedBuilder({
			author: Object.assign(interaction.user, { name: interaction.user.username, icon_url: interaction.user.avatarURL() || undefined }),
			footer: { text: "Sending ping..." }
		})
		const msg = await interaction.followUp({ embeds: [embed] });

		// 3. Get estimated ping from client and also calculate ping using difference in msg's and interaction's creation time.
		const ping = Math.round(this.container.client.ws.ping);
		const diff = msg instanceof Message ?
			`Round trip took: ${msg.createdTimestamp - interaction.createdTimestamp}ms. Heartbeat: ${ping}ms.` :
			"I can't you how long it took because Discord gave me something else other than Message...? This error message probably doesn't mean anything to you but whatever.";
		
		// 4. Notify the logger run is successful.
		this.logger?.info(`${runID} Run Success!`)
		
		// 5. Change up the embed a little to show ping/delay, and then edit the "Loading" embed.
		embed.setFooter({ text: `Pong 🏓! (${diff})` });
		return interaction.editReply({ embeds: [embed] });
	}
}