export interface IPlayer {
    username: string,
    class: IClass
    mods: Omit<IClass, 'name'>
    hp: number
    def: number
    location: number
}

export interface IClass {
    readonly name: string
    readonly mhp: number
    readonly str: number
    readonly spd: number
    readonly def: number
    readonly rcv: number
    readonly prc: number
    readonly amr: number
}

export interface IUser {
    class: string,
}