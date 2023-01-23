import { ChatInputCommand, Command } from '@sapphire/framework';
import { Message, MessageEmbed } from 'discord.js';
import winstonLogger from '../logger';
import { bot } from '../botClient';

export class PingCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      description: "Ping the server and see how laggy you are for yourself!"
    });
  }

  public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder.setName('ping').setDescription('Ping bot to see if it is alive')
    );
  }

  public async chatInputRun(interaction: Command.ChatInputInteraction) {
    await interaction.deferReply();
    const runID = `[PingCommand ChatInputRun #${interaction.id}]`;
    winstonLogger.log('info', `${runID} Called from ${interaction.user.username}`)

    const embed = new MessageEmbed({
      author: Object.assign(bot.user!, { name: bot.user?.username }),
      footer: {
        text: "Loading..."
      }
    })
    const msg = await interaction.followUp({ embeds: [embed] });
    const ping = Math.round(this.container.client.ws.ping);
    const diff = msg instanceof Message?
      `Round trip took: ${msg.createdTimestamp - interaction.createdTimestamp}ms. Heartbeat: ${ping}ms.`:
      "I can't you how long it took because Discord gave me something else other than Message...? This error message probably doesn't mean anything to you but whatever.";
    winstonLogger.log('info', `${runID} Run Success!`)
    embed.footer!.text = `Pong 🏓! (${diff})`;
    return interaction.editReply({ embeds: [embed] });
  }
}