import { InteractionHandler, InteractionHandlerTypes, PieceContext } from '@sapphire/framework';
import { AutocompleteInteraction } from 'discord.js';
import { IClass } from '../typing';
import EVEBase from '../util/firebase';

export class SelectAutoCompleteHandler extends InteractionHandler {
    private fbCache: Record<string, IClass> | null = null;
    private life: number = 0;
    public constructor(ctx: PieceContext, options: InteractionHandler.Options) {
        setInterval(() => this.life++, 100);
        super(ctx, {
            ...options,
            interactionHandlerType: InteractionHandlerTypes.Autocomplete
        });
    }

    public override async parse(interaction: AutocompleteInteraction) {
        // Only run this interaction for the command with ID '1000802763292020737'
        if (interaction.commandName !== 'select') return this.none();

        // Get the focussed (current) option
        const focusedOption = interaction.options.getFocused(true);

        if (!this.fbCache || this.life > 100) {
            this.life = 0;
            this.fbCache = await EVEBase.GetClasses();
        }

        switch (focusedOption.name) {
            case 'class': {
                return this.some(Object.keys(this.fbCache).map(_ => ({ name: _, value: _ })));
            }
            default:
                return this.none();
        }
    }

    public override async run(interaction: AutocompleteInteraction, result: InteractionHandler.ParseResult<this>) {
        return interaction.respond(result);
    }
}