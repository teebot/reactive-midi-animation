import {Line} from "./line";

export type GameState = {
    circleX: number,
    color: number,
    lines: Array<Line>
};

export const defaultGameState: GameState = {
    circleX: 64,
    color: 0x9966FF,
    lines: [
        {on: false, x1: 250, x2: 550, y1: 200, y2: 200, color: 0xFF0000, opacity: 1, currLifecycle: 0, dieAt: 10000},
        {on: false, x1: 550, x2: 550, y1: 200, y2: 400, color: 0x00FF00, opacity: 1, currLifecycle: 0, dieAt: 10000},
        {on: false, x1: 550, x2: 250, y1: 400, y2: 400, color: 0x0000FF, opacity: 1, currLifecycle: 0, dieAt: 10000},
        {on: false, x1: 250, x2: 250, y1: 400, y2: 200, color: 0xFFFFFF, opacity: 1, currLifecycle: 0, dieAt: 10000}
    ]
};

