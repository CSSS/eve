import { ChatInputCommand, Command } from "@sapphire/framework";
import { ActionRowBuilder, UserSelectMenuBuilder } from "discord.js";

export class StartCommand extends Command {
    public constructor (context: Command.Context, options: Command.Options) {
        super(context, {...options})
    }

    public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
        registry.registerChatInputCommand(builder => {
            builder
                .setName("start")
                .setDescription("Start a speedslider.")
                .addIntegerOption(option => option
                    .setName('num')
                    .setDescription("Set the number of players.")
                    .setRequired(true));
        });
    }

    public async chatInputRun(interaction: Command.ChatInputCommandInteraction, context: ChatInputCommand.RunContext) {
        await interaction.deferReply();

        const num: number = interaction.options.getInteger('num')!;

        // context menu asks for players
        const row = new ActionRowBuilder<UserSelectMenuBuilder>()
            .addComponents(
                new UserSelectMenuBuilder()
                    .setCustomId("pickplayer")
                    .setMinValues(num)
                    .setMaxValues(num)
            );
        

        return interaction.followUp({ content: "Pick the associated players.", components: [row] })
        // green button executes go

        // while loop runs the slider

        // red button shuts it down

        // follow-up concludes command
    }
}