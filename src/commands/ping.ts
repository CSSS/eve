import { ChatInputCommand, Command } from '@sapphire/framework';
import { Message, MessageEmbed } from 'discord.js';

export class PingCommand extends Command {
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, {...options});
	}

	public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName('ping')
				.setDescription('Ping bot to see if it is alive')
		);
	}

	public async chatInputRun(interaction: Command.ChatInputInteraction) {
		await interaction.deferReply();
		const runID = `[PingCommand ChatInputRun #${interaction.id}]`;
		console.log('ping', `${runID} Called from ${interaction.user.username}`)

		const embed = new MessageEmbed({
			author: Object.assign(interaction.user, { name: interaction.user.username, icon_url: interaction.user.avatarURL() || undefined }),
			footer: { text: "Sending ping..." }
		})
		const msg = await interaction.followUp({ embeds: [embed] });
		const ping = Math.round(this.container.client.ws.ping);
		const diff = msg instanceof Message ?
			`Round trip took: ${msg.createdTimestamp - interaction.createdTimestamp}ms. Heartbeat: ${ping}ms.` :
			"I can't you how long it took because Discord gave me something else other than Message...? This error message probably doesn't mean anything to you but whatever.";
		console.log('ping', `${runID} Run Success!`)
		embed.footer!.text = `Pong 🏓! (${diff})`;
		return interaction.editReply({ embeds: [embed] });
	}
}