import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import type { AutocompleteInteraction, GuildMemberRoleManager } from 'discord.js';
import { IAMCommand } from '../../commands/iam';

export class AutocompleteHandler extends InteractionHandler {
  public constructor(ctx: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
    super(ctx, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.Autocomplete
    });
  }

  public override async run(interaction: AutocompleteInteraction, result: InteractionHandler.ParseResult<this>) {
    return interaction.respond(result);
  }

  public override async parse(interaction: AutocompleteInteraction) {
    if (interaction.commandName !== 'iam') return this.none();
    const member_roles = interaction.member.roles as GuildMemberRoleManager;

    const fc = interaction.options.getFocused(true);
    const roles = await interaction.guild.roles.fetch()
    const rgx = /^[a-z]/g
    const all_roles = Array.from(roles.values())
      .filter(r => 
        r.name.match(fc.value)
        && r.name.match(rgx)
        && !member_roles.cache.has(r.id)
      )
      .map(r => ({ "name": r.name, "value": r.id }));
    
    if (all_roles.length > 25) {
      const missing = all_roles.length - 24;
      const few_roles = all_roles.splice(0, 24);
      few_roles.push({
        name: `[... ${missing} not shown]`,
        value: IAMCommand.INVALID_ID
      })
      return this.some(few_roles);
    }
    else {
      return this.some(all_roles);
    }
  }
}