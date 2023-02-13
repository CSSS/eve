import { ChatInputCommand, Command } from "@sapphire/framework";
import { EmbedBuilder } from "discord.js";
import Watcher from "../watcher";

export class EchoCommand extends Command {
    public constructor (context: Command.Context, options: Command.Options) {
        super(context, {...options})
    }

    public override async registerApplicationCommands(registry: ChatInputCommand.Registry) {
		await Watcher.Add('echo', process.env.GUILD_ID!);
        registry.registerChatInputCommand(builder => {
            builder
				.setName("echo")
				.setDescription("Let the bot speak what you dare not.")
				.addStringOption(option => 
					option
						.setName("message")
						.setDescription("anything, really")
						.setRequired(true))
        })
    }

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction, context: ChatInputCommand.RunContext) {
		const author = Object.assign(interaction.user, { name: interaction.user.username, icon_url: interaction.user.avatarURL() || undefined });
		const message = interaction.options.data.map(_ => typeof(_.value) === 'string' ? _.value : "").join("")
		const runID = `[EchoCommand ChatInputRun #${interaction.id}]`;
		console.log('echo', `${runID} ${interaction.user.username} echoed: "${message}"`)
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