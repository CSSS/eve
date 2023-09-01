import { SapphireClient as Client } from "@sapphire/framework";
import {GatewayIntentBits} from "discord.js";
import {EveLogger} from "./logging/logInitializer";
import {EveLogUploader} from "./logging/logUploader";
// import dotenv from 'dotenv';
// dotenv.config();

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


Bot.Start().then(() => console.log("bot started!!"))
