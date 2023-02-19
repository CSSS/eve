import { InteractionHandler, InteractionHandlerTypes, PieceContext } from '@sapphire/framework';
import { ButtonInteraction } from 'discord.js';

export class StartClickNextHandler extends InteractionHandler {
    public constructor(ctx: PieceContext, options: InteractionHandler.Options) {
        super(ctx, {
            ...options,
            interactionHandlerType: InteractionHandlerTypes.Button
        });
    }

    public override async parse(interaction: ButtonInteraction) {
        if (interaction.customId !== 'battle-cast') return this.none();
        return this.some();
    }

    public override async run(interaction: ButtonInteraction) {
        await interaction.deferReply();

        

        return await interaction.editReply(``);
    }
}