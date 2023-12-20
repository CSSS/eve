import { ChatInputCommand, Command } from '@sapphire/framework';
import Mailgen from 'mailgen';
import { createTransport } from 'nodemailer';

/**
 * Command: /echo [email address]
 * Purpose: Sends a sample email to the address provided.
 */
export class SendEmailCommand extends Command {
    public constructor(context: Command.LoaderContext, options: Command.Options) {
        super(context, {...options});
    }

    public override async registerApplicationCommands(registry: ChatInputCommand.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName('send-email')
                .setDescription('Send email')
                .addStringOption(option =>
                  option // param 1: the email to send to (required)
                    .setName("email")
                    .setDescription("email to send mail to")
                    .setRequired(true))
        );
    }

    public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        await interaction.deferReply(); // async command. Requires a defer in reply in case async takes too long.

        try {
          // create reusable transporter object using the default SMTP transport
          const transporter = createTransport({
            service: 'gmail',
            auth: {
              pass: process.env.MAIL_PASS,
              user: process.env.MAIL_EMAIL
            }
          });

          const response = new Mailgen({
            theme: 'default',
            product: { name: 'Mailgen', link: 'https://mailgen.js' }
          }).generate({
            body: {
              intro: "You have received a mail",
              outro: "Or did you receive a mail? Schoedinger's Mail."
            }
          })

          // send mail with defined transport object
          const info = await transporter.sendMail({
            from: process.env.MAIL_EMAIL,
            to: interaction.options.getString('email')!,
            subject: "A test email.",
            html: response
          });

          console.info(info);

          return interaction.followUp("Done.")
        }
        catch(err) {
          console.error(err)
          return interaction.followUp(`Error: \`${err?.toString()}\``)
        }
    }
}