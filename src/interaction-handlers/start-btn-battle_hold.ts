import { InteractionHandler, InteractionHandlerTypes, PieceContext } from '@sapphire/framework';
import { ButtonInteraction, EmbedBuilder } from 'discord.js';
import { Battle, Player } from '../util/battle';

export class StartClickNextHandler extends InteractionHandler {
    public constructor(ctx: PieceContext, options: InteractionHandler.Options) {
        super(ctx, {
            ...options,
            interactionHandlerType: InteractionHandlerTypes.Button
        });
    }

    public override async parse(interaction: ButtonInteraction) {
        if (interaction.customId !== 'battle-hold') return this.none();
        return this.some();
    }

    public override async run(interaction: ButtonInteraction) {
        await interaction.deferReply();
        const battle = Battle.Get(interaction.channelId);

        // acting player has decided to hold => find acting player
        const actingPlayer: Player | null = battle?.ActingPlayer() || null;
        
        if (battle && actingPlayer && interaction.isButton()) {
            // hold for the acting player
            actingPlayer.hold = true;

            // show the next acting player
            battle.Run();
            await interaction.deleteReply();
            return await interaction.message.edit(Battle.GetInteraction(interaction.channelId));
        }
        else {
            return await interaction.message.edit({ embeds: [new EmbedBuilder().setTitle("This session has been rendered invalid.")] });
        }
    }
}