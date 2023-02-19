import { ChatInputCommand, Command } from "@sapphire/framework";
import EVEBase from "../util/firebase";

export class AddClassCommand extends Command {
    public constructor (context: Command.Context, options: Command.Options) {
        super(context, {...options})
    }

    public override async registerApplicationCommands(registry: ChatInputCommand.Registry) {
        registry.registerChatInputCommand(builder => {
            return builder
                .setName("add-class")
                .setDescription("Adds a class in the database.")
                .addStringOption(o => o
                    .setName("name")
                    .setDescription("name of the class")
                    .setRequired(true))
                .addNumberOption(o => o
                    .setName('mhp')
                    .setDescription('max HP')
                    .setRequired(true))
                .addNumberOption(o => o
                    .setName('str')
                    .setDescription('strength')
                    .setRequired(true))
                .addNumberOption(o => o
                    .setName('amr')
                    .setDescription('armour')
                    .setRequired(true))
                .addNumberOption(o => o
                    .setName('prc')
                    .setDescription('precision')
                    .setRequired(true))
                .addNumberOption(o => o
                    .setName('spd')
                    .setDescription('speed')
                    .setRequired(true))
                .addNumberOption(o => o
                    .setName('def')
                    .setDescription('defence')
                    .setRequired(true))
                .addNumberOption(o => o
                    .setName('rcv')
                    .setDescription('recovery')
                    .setRequired(true))
        });
    }

    public async chatInputRun(interaction: Command.ChatInputCommandInteraction, context: ChatInputCommand.RunContext) {
        await interaction.deferReply();
        const className = interaction.options.getString('name')!;
        const mhp = interaction.options.getNumber('mhp')!;
        const str = interaction.options.getNumber('str')!;
        const spd = interaction.options.getNumber('spd')!;
        const amr = interaction.options.getNumber('amr')!;
        const prc = interaction.options.getNumber('prc')!;
        const def = interaction.options.getNumber('def')!;
        const rcv = interaction.options.getNumber('rcv')!;
        
        await EVEBase.Database.collection('Classes').doc(className).set({
            name: className,
            str: str,
            amr: amr,
            prc: prc,
            spd: spd,
            def: def,
            mhp: mhp,
            rcv: rcv,
        })

        return await interaction.followUp(`Success. Added "${className}"`)
    }
}