// import { isMessageInstance } from '@sapphire/discord.js-utilities';
import { ChatInputCommand, Command } from '@sapphire/framework';
import { Message } from 'discord.js';

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

    if (msg instanceof Message) {
      const diff = msg.createdTimestamp - interaction.createdTimestamp;
      const ping = Math.round(this.container.client.ws.ping);
      return interaction.editReply(`Pong 🏓! (Round trip took: ${diff}ms. Heartbeat: ${ping}ms.)`);
    }

    return interaction.editReply('Failed to retrieve ping :(');
  }
}

/*
Argument of type 'APIMessage | Message<boolean>' is not assignable to parameter of type 'Message<boolean> | APIMessage'.
Type 'APIMessage' is not assignable to type 'Message<boolean> | APIMessage'.
  Type
  'import("c:/Users/tszmi/Documents/Code/EVE/node_modules/discord.js/node_modules/discord-api-types/payloads/v9/channel").APIMessage' is not assignable to type
  'import("c:/Users/tszmi/Documents/Code/EVE/node_modules/discord-api-types/payloads/v9/channel").APIMessage'.
    The types of 'author.flags' are incompatible between these types.
  
  Type
  'import("c:/Users/tszmi/Documents/Code/EVE/node_modules/discord.js/node_modules/discord-api-types/payloads/v9/user").UserFlags | undefined' is not assignable to type
  'import("c:/Users/tszmi/Documents/Code/EVE/node_modules/discord-api-types/payloads/v9/user").UserFlags | undefined'.
  
  Type
  'import("c:/Users/tszmi/Documents/Code/EVE/node_modules/discord.js/node_modules/discord-api-types/payloads/v9/user").UserFlags' is not assignable to type
  'UserFlags'.ts(2345)
*/