import { ChatInputCommand, Command } from '@sapphire/framework';
import { Message } from 'discord.js';
import logger from '../logger';

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
    const msg = await interaction.reply({ content: `Ping?`, ephemeral: true, fetchReply: true });
    const runID = `[PingCommand ChatInputRun #${interaction.id}]`;
    logger.log('info', `${runID} Called from ${interaction.user.username}`)

    if (msg instanceof Message) {
      const diff = msg.createdTimestamp - interaction.createdTimestamp;
      const ping = Math.round(this.container.client.ws.ping);
      logger.log('info', `${runID} Run Success!`)
      return interaction.editReply(`Pong 🏓! (Round trip took: ${diff}ms. Heartbeat: ${ping}ms.)`);
    }

    logger.log('error', `${runID} Run failure. Msg is not an instance of Discord.Message`)
    return interaction.editReply('Failed to retrieve ping :(');
  }
}