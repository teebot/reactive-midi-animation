import {Laser} from "./laser";

export type GameState = {
    circleX: number,
    color: number,
    lasers: Array<Laser>
};

export const defaultGameState: GameState = {
    circleX: 64,
    color: 0x9966FF,
    lasers: [
        {visible: false, keyDown: false, x1: -25, x2: 200, y1: 0, y2: 600, color: 0xff0049, opacity: 1, appearedAt: 0, decayFor: 1000, glow: 2, sustain: true, decaying: false},
        {visible: false, keyDown: false, x1: 140, x2: 30, y1: 0, y2: 600, color: 0x00ebb3, opacity: 1, appearedAt: 0, decayFor: 1000, glow: 2, sustain: true, decaying: false},
        {visible: false, keyDown: false, x1: 320, x2: 420, y1: 0, y2: 600, color: 0x2befed, opacity: 1, appearedAt: 0, decayFor: 1000, glow: 2, sustain: true, decaying: false},
        {visible: false, keyDown: false, x1: 650, x2: 360, y1: 0, y2: 600, color: 0xc8ff00, opacity: 1, appearedAt: 0, decayFor: 1000, glow: 2, sustain: true, decaying: false},
        {visible: false, keyDown: false, x1: 700, x2: 900, y1: 0, y2: 600, color: 0xf6fc2d, opacity: 1, appearedAt: 0, decayFor: 1000, glow: 2, sustain: true, decaying: false},
        {visible: false, keyDown: false, x1: 920, x2: 600, y1: 0, y2: 600, color: 0xff891f, opacity: 1, appearedAt: 0, decayFor: 1000, glow: 2, sustain: true, decaying: false}
    ]
};

