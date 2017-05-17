import {Laser} from "../graphics/laser";
import {BoringBox} from "../graphics/boringBox";
import {Triangle} from "../graphics/triangle";

/**
 * Constains current game state
 */
export type GameState = {
    lasers: Array<Laser>,
    boringBoxes: Array<BoringBox>,
    triangles: Array<Triangle>
};

/**
 * Default game state containing all possible objects that will ever exist
 */
export const defaultGameState: GameState = {
    lasers: [
        new Laser(0),
        new Laser(1),
        new Laser(2),
        new Laser(3),
        new Laser(4),
        new Laser(5)
    ],
    boringBoxes: [
        new BoringBox(0)
    ],
    triangles: [
        new Triangle(0),
        new Triangle(1),
        new Triangle(2),
        new Triangle(3)
    ]
};

