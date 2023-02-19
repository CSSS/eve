import { ChatInputCommand, Command } from "@sapphire/framework";
import EVEBase from "../util/firebase";

export class SelectCommand extends Command {
    public constructor (context: Command.Context, options: Command.Options) {
        super(context, {...options})
    }

    public override async registerApplicationCommands(registry: ChatInputCommand.Registry) {
        registry.registerChatInputCommand(builder => {
            return builder
                .setName("select")
                .setDescription("Select a class.")
                .addStringOption(o => o
                    .setName("class")
                    .setDescription("your class of choice")
                    .setRequired(true)
                    .setAutocomplete(true))
        })
    }

    public async chatInputRun(interaction: Command.ChatInputCommandInteraction, context: ChatInputCommand.RunContext) {
        await interaction.deferReply();
        
        const option = interaction.options.getString('class')!
        const writeResult = await EVEBase.SetUser(interaction.user.id, 'class', option);

        return await interaction.followUp("You chose " + option);
    }
}