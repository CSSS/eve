import { InteractionHandler, InteractionHandlerTypes, PieceContext } from '@sapphire/framework';
import { EmbedBuilder, TextChannel, User, UserSelectMenuInteraction } from 'discord.js';
import { DocumentData, FieldPath, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { Battle, Player } from '../util/battle';
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
        return this.some();
    }

    public async run(interaction: UserSelectMenuInteraction) {
        await interaction.deferReply();

        if (interaction.channel instanceof TextChannel) {
            // checkout picked players' data in firebase
            const idsSelected = interaction.values;
            const usersSelected = interaction.users;
            
            const query = await EVEBase.Database.collection('Users').where(FieldPath.documentId(), 'in', idsSelected).get()
            const docs: QueryDocumentSnapshot<DocumentData>[] = [];
            query.forEach(_dd => docs.push(_dd));

            // initiate player based on firebase data
            const players: Player[] = [];

            for (const _dd of docs) {
                const dd = _dd.data();
                const className = dd.class as string | undefined;
                if (className !== undefined) {
                    const classs = await EVEBase.GetClass(className);
                    const newPlayer = new Player({
                        username: (usersSelected.get(_dd.id) as User).username,
                        class: classs!,
                        mods: Player.ClassZero(),
                        hp: dd.maxHP,
                        def: 0,
                        location: 0,
                    });
                    console.info(newPlayer)
                    players.push(newPlayer);
                }
            }

            if (players.length > 0) {
                Battle.New(interaction.channel, players).Run();
                await interaction.followUp({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Load success")
                            .setDescription(players.map((p,i) => `${i+1}. __${p.username}__ playing as __${p.class.name}__`).join('\n'))
                    ]
                });
            }

            return await interaction.followUp(Battle.GetInteraction(interaction.channelId));
        }
        else {
            return await interaction.followUp("Please do this command in a textchannel of a server!")
        }
    }
}