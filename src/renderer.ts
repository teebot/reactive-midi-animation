import {Application} from 'pixi.js';
import {GameState} from './types/gameState';
import Graphics = PIXI.Graphics;
import {Base} from './graphics/base';

let graphics: { [key: string]: Array<Graphics> };
const app = new Application(800, 600, {backgroundColor: 0x000000});

/**
 * initialises all possible graphics based visible the default game state
 * @param canvasDomContainer
 * @param defaultGameState
 */
function init(canvasDomContainer: Element, defaultGameState: GameState) {
    canvasDomContainer.appendChild(app.view);
    canvasDomContainer.querySelector('canvas').addEventListener('dblclick', fullscreenHandler);

    // initial graphics flattened from initial game state
    // each graphic type is assigned an array of raw pixiJS graphic objects
    graphics = Object.keys(defaultGameState).reduce((obj, currentKey) => {
        const current = {};
        current[currentKey] = defaultGameState[currentKey].map((base: Base) => base.draw());
        return Object.assign(obj, current);
    }, {});

    Object.keys(graphics).forEach(k => graphics[k].forEach(o =>
        o.forEach(i => app.stage.addChild(i))
    ));
}

function fullscreenHandler(): void {
    const el: Element = document.querySelector('canvas');
    if (el.webkitRequestFullScreen) {
        el.webkitRequestFullScreen();
    } else {
        console.log('Full screen not supported');
    }
}

/**
 * render routine which will take the current game state and apply all
 * properties to objects visible screen
 * @param gameState
 * @returns {{[p: string]: Array<Graphics>}}
 */
function render(gameState: GameState): void {
    // Apply game state to all sets of graphics
    Object.keys(graphics).forEach(graphicType => {
        gameState[graphicType].forEach((item, index) => {
            item.applyStateToGraphics(graphics[graphicType][index]);
        });
    });
}

export const pixiApp = {
    render,
    init
};
