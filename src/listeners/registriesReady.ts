import { ApplicationCommandRegistry, Events, Listener } from '@sapphire/framework';
import WinstonLogger from '../logging/logger';

export class ReadyListener extends Listener {
  public constructor(context: Listener.Context, options: Listener.Options) {
    super(context, {
      ...options,
      once: true,
      event: Events.ApplicationCommandRegistriesRegistered
    });
  }

  public async run(map: Map<string, ApplicationCommandRegistry>) {
    await WinstonLogger.Initialise()
  }
}