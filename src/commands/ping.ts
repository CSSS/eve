import { ChatInputCommand, Command } from '@sapphire/framework';
import { Message, MessageEmbed } from 'discord.js';
import winstonLogger from '../logger';
import { bot } from '../botClient';

export class PingCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, { ...options });
  }

  public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder.setName('ping').setDescription('Ping bot to see if it is alive')
    );
  }

  public async chatInputRun(interaction: Command.ChatInputInteraction) {
    const embed = new MessageEmbed({
      author: Object.assign(bot.user!, { name: bot.user?.username }),
      footer: {
        text: "Loading..."
      }
    })
    await interaction.deferReply();
    const runID = `[PingCommand ChatInputRun #${interaction.id}]`;
    winstonLogger.log('info', `${runID} Called from ${interaction.user.username}`)

    const msg = await interaction.followUp({ embeds: [embed] });
    if (msg instanceof Message) {
      const diff = msg.createdTimestamp - interaction.createdTimestamp;
      const ping = Math.round(this.container.client.ws.ping);
      winstonLogger.log('info', `${runID} Run Success!`)
      embed.footer!.text = `Pong 🏓! (Round trip took: ${diff}ms. Heartbeat: ${ping}ms.)`;
      return interaction.editReply({ embeds: [embed] });
    }

    winstonLogger.log('error', `${runID} Run failure. Msg is not an instance of Discord.Message`)
    embed.footer!.text = 'Failed to retrieve ping :(';
    return interaction.editReply({ embeds: [embed] });;
  }
}