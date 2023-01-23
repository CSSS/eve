import { ChatInputCommand, Command } from "@sapphire/framework";
import { MessageEmbed } from "discord.js";

export class EchoCommand extends Command {
    public constructor (context: Command.Context, options: Command.Options) {
        super(context, {...options})
    }

    public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
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

	public async chatInputRun(interaction: Command.ChatInputInteraction, context: ChatInputCommand.RunContext) {
		return interaction.reply({
			embeds: [
				new MessageEmbed({
					author: Object.assign(interaction.user, { name: interaction.user.username, icon_url: interaction.user.avatarURL() || undefined }),
					description: interaction.options.data.map(_ => typeof(_.value) === 'string' ? _.value : "").join("")
				})
			]
		})
	}
}