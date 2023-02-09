import { InteractionHandler, InteractionHandlerTypes, PieceContext } from '@sapphire/framework';
import type { UserSelectMenuInteraction } from 'discord.js';
import EVEBase from '../util/firebase';

export class StartPickPlayerHandler extends InteractionHandler {
  public constructor(ctx: PieceContext, options: InteractionHandler.Options) {
    super(ctx, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.SelectMenu
    });
  }

  public async parse(interaction: UserSelectMenuInteraction) {
    if (interaction.customId !== 'pickplayer') return this.none();
    await interaction.deferReply();
    return this.some();
  }

  public async run(interaction: UserSelectMenuInteraction) {
    const idsSelected = interaction.values;
    const query = EVEBase.Database.collection('Users').where('id', 'in', idsSelected)

    console.log(query)

    await interaction.followUp({
      // Remember how we can have multiple values? Let's get the first one!
      content: `You selected: ${interaction.values.join(", ")}`
    });
  }
}