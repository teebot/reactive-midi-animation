import {Laser} from "./laser";

export type GameState = {
    lasers: Array<Laser>
};

export const defaultGameState: GameState = {
    lasers: [
        new Laser(0),
        new Laser(1),
        new Laser(2),
        new Laser(3),
        new Laser(4),
        new Laser(5)
    ]
};

