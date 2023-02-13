import dotenv from 'dotenv';
import Bot from "./botClient";
import WinstonLogger from "./logger";
dotenv.config()
WinstonLogger.Initialise()
Bot.Start()