import {defaultLasers, Laser} from "./laser";

export type GameState = {
    circleX: number,
    color: number,
    lasers: Array<Laser>
};

export const defaultGameState: GameState = {
    circleX: 64,
    color: 0x9966FF,
    lasers: defaultLasers
};

