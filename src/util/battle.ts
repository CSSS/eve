import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, TextChannel } from 'discord.js';
import { IClass, IPlayer } from '../typing';

export class Player implements IPlayer {
    public static ClassZero() {
        return Object.assign({}, {
            mhp: 0,
            str: 0,
            spd: 0,
            def: 0,
            rcv: 0,
            prc: 0,
            amr: 0,
        });
    }

    username: string
    class: IClass
    mods: Omit<IClass, 'name'>
    hold: boolean = false
    
    hp: number = 0
    def: number = 0
    location: number = 0

    constructor(_: IPlayer) {
        Object.assign(this, _);
        this.username = _.username;
        this.mods = Player.ClassZero()
        this.class = _.class;
        this.hp = this.Calculate('mhp');
        this.def = this.Calculate('def');
    }


    Calculate(stat: keyof Omit<IClass, 'name'>) {
        return this.class[stat] * (1+this.mods[stat])
    }
}

export class Battle {
    public static map: Record<string, Battle>;

    public static Get(channelID: string): Battle | null {
        return this.map[channelID];
    }
    public static New(channel: TextChannel, players: Player[]) {
        if (!Battle.map) Battle.map = {};
        if (!Battle.map[channel.id]) {
            Battle.map[channel.id] = new Battle(channel, players);
        }
        return Battle.map[channel.id];
    }

    public static SendInteraction(channel: TextChannel) {
        return channel.send(this.GetInteraction(channel.id));
    }

    public static GetInteraction(channelID: string) {
        const actionrow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('battle-cast')
                    .setLabel("Cast")
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('battle-hold')
                    .setLabel("Hold")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('battle-recover')
                    .setLabel("Recover")
                    .setStyle(ButtonStyle.Secondary))
        
        const battle = this.map[channelID];
        return { embeds: [
            new EmbedBuilder()
                // .setTitle("Button Int.")
                .setDescription(
                    this.map[channelID]?.players
                        .sort((p1, p2) => {
                            const p1Holds = -(200 * Number(p1.hold));
                            const p2Holds = (200 * Number(p2.hold));
                            return p1.location - p2.location + p1Holds + p2Holds;
                        })
                        .map((p, i, a) => {
                            const actPointer = i === a.length - 1 ? "ACT=>":"";
                            const holding = p.hold ? "__HOLD__" : '';
                            return `${actPointer}(**${p.location}**) ${p.username} [${p.class.name}] ${holding}`;
                        })
                        .join('\n') || "This session has been rendered invalid.")
        ], components: [actionrow] };
    }
    
    players: Player[];
    private constructor(channel: TextChannel, players: Player[]) {
        if (!Battle.map) Battle.map = {};

        this.players = players;
        Battle.map[channel.id] = this;
    }

    ActingPlayer(): Player | null {
        return this.players.filter(p => !p.hold).sort((p1, p2) => (p2.location - p1.location))[0] || null;
    }

    ReportCard() {
        return this.players.map(p => `[${p.username}] ${p.location}${" (hold)".repeat(Number(p.hold))}`);
    }

    Run() {
        console.info(this.ReportCard())

        while (!this.players.find(p => !p.hold && p.location >= 100)) {
            this.players.forEach(p => {
                p.location += p.class.spd
                if (p.location > 200) {
                    p.location = 0;
                    p.hold = false;
                }
            });
        }

        console.info(this.ReportCard())
    }
}