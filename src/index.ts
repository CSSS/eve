import { SapphireClient as Client } from "@sapphire/framework";

// import dotenv from 'dotenv';
// dotenv.config();
import { GatewayIntentBits, REST, Routes } from "discord.js";
import dotenv from 'dotenv';
import { EveLogger } from "./logging/logInitializer";
import { EveLogUploader } from "./logging/logUploader";
dotenv.config();

export class Bot {
    static Client = new Client({
        intents: [
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.Guilds
        ]
    });

    /**
     *
     * @constructor
     */
    static async Start() {
        let logger = new EveLogger().cmd_logger;
        logger.info("logging into discord")
        await Bot.Client.login(process.env.BOT_TOKEN);
        let watcher = new EveLogUploader();
        await watcher.setupCategoryAndLogChannels(logger);
        watcher.UploadLogsToDiscord();
    }
}

const rest = new REST().setToken(process.env.BOT_TOKEN);

rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: [] })
    .then(() => console.log('Successfully deleted all guild commands.'))
    .catch(console.error);

// for global commands
rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: [] })
    .then(() => console.log('Successfully deleted all application commands.'))
    .catch(console.error);

Bot.Start().then(() => console.log("bot started!!"))
