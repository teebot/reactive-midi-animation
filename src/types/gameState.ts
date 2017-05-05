import {Laser} from "../graphics/laser";
import {BoringBox} from "../graphics/boringBox";

/**
 * Constains current game state
 */
export type GameState = {
    lasers: Array<Laser>,
    boringBoxes: Array<BoringBox>
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
        new BoringBox(0),
        new BoringBox(1)
    ]
};

