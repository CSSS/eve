import { ChatInputCommand, Command } from "@sapphire/framework";
import { EmbedBuilder, GuildMemberRoleManager } from "discord.js";
import { Logger } from "winston";
import { Bot } from "..";
import { EveLogger } from "../logging/logInitializer";
import { EveLogUploader } from "../logging/logUploader";

/**
 * Command: /iam [course]
 * Purpose: The bot tries to find the course referred and assigns the role to the user. Find course using: /[a-z]{4}\d{3}/gi (i.e., 4 letters + 3 numbers, case insensitive)
 */
export class IAMCommand extends Command {
	public static readonly INVALID_ID = "_INVALID_";
	public static readonly INVALID_COMMENT = '## Better improve the autocompletion results by typing more in the selection box.';
	private logger?: Logger;
    public constructor (context: Command.Context, options: Command.Options) {
        super(context, {...options})
    }

    public override async registerApplicationCommands(registry: ChatInputCommand.Registry) {
		// this.logger is a customised Winston Logger. It logs onto the console and onto Winston (file system) at the same time.
		this.logger = (new EveLogger('iam')).cmd_logger;
		let watcher = new EveLogUploader();
		await watcher.setupCategoryAndLogChannels(this.logger, 'iam');
		watcher.UploadLogsToDiscord();
		registry.registerChatInputCommand(builder => {
			builder
				.setName("iam")
				.setDescription("Assign a role for yourself, indicating your courses taken.")
				.addStringOption(option =>
					option // param 1: the name of the course
						.setName("course")
						.setDescription("the course number")
						.setRequired(true)
						.setAutocomplete(true))
		})
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction, context: ChatInputCommand.RunContext) {
		await interaction.deferReply();

		// 1. Create the embed used to respond to the user.
		const course = interaction.options.getString('course');
		const embed = new EmbedBuilder({
			author: Object.assign(interaction.user, {
				name: interaction.user.username,
				icon_url: interaction.user.avatarURL() || undefined
			}),
			description: `Cannot find role: "${course}"`,
			timestamp: interaction.createdTimestamp,
		})

		// 2. Log
		const runID = `[IAMCommand ChatInputRun #${interaction.id}]`;
		this.logger?.info(`${runID} ${interaction.user.username} selected: "${course}"`)

		// 3. Get roles, and then assign.
		const roles = await interaction.guild.roles.fetch();
		const selected_role = roles.find(r => r.name === course);
		if (selected_role) {
			embed.setDescription(`You've been giving the role: "${course}"`);
			const gm_roles = interaction.member.roles as GuildMemberRoleManager;
			await gm_roles.add(selected_role).catch(e => {
				this.logger.error(`${runID} Couldn't add role to the interaction user ${interaction.user}.`);
				this.logger.error(e);
			});
		}
		else if (course === IAMCommand.INVALID_ID) {
			embed.setAuthor(Object.assign(Bot.Client.user, {
				name: Bot.Client.user.username,
			}))
			embed.setDescription(IAMCommand.INVALID_COMMENT)
		}
		
		return interaction.followUp({
			embeds: [embed]
		})
	}
}