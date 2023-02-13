import { InteractionHandler, InteractionHandlerTypes, PieceContext } from '@sapphire/framework';
import { ActionRowBuilder, UserSelectMenuInteraction } from 'discord.js';
import { DocumentData, FieldPath } from 'firebase-admin/firestore';
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
        // await interaction.deferReply();
        const idsSelected = interaction.values;
        const querySelectedUsers = await EVEBase.Database.collection('Users').where(FieldPath.documentId(), 'in', idsSelected).get()

        await interaction.followUp("Load success");

        // while loop runs the slider
        const players: DocumentData[] = [];
        querySelectedUsers.forEach(p => players.push(p.data()));
        while (true) {
            // create a new multi-buttons interaction
            const actionrow = new ActionRowBuilder()
                .addComponents(
                // new ButtonInteraction()
            )

            await interaction.editReply(`${Math.random()}`);
        }

        // follow-up concludes command
        await interaction.followUp({
            // Remember how we can have multiple values? Let's get the first one!
            content: `You selected: ${interaction.values.join(", ")}`
        });
    }
}