export interface IPlayer {
    class: IClass
    mods: Omit<IClass, 'mods'>
    hp: number
    location: number
}

export interface IClass {
    readonly mhp: number
    readonly str: number
    readonly spd: number
    readonly def: number
    readonly rcv: number
    readonly prc: number
    readonly amr: number
}