import {Application} from 'pixi.js';
import {GameState} from './types/gameState';
import Graphics = PIXI.Graphics;

const defaultSize = [800, 600];

let graphicsByType: Map<string, Array<Array<Graphics>>>;
const app = new Application(defaultSize[0], defaultSize[1], {backgroundColor: 0x000000});

/**
 * initialises all possible graphics based visible the default game state
 * @param canvasDomContainer
 * @param defaultGameState
 */
const init = (canvasDomContainer: Element, defaultGameState: GameState): void => {
    canvasDomContainer.appendChild(app.view);
    canvasDomContainer.querySelector('canvas').addEventListener('dblclick', fullscreenHandler);

    // initial graphics flattened from initial game state
    // each graphic type is assigned an array of raw pixiJS graphic objects
    graphicsByType = Object.keys(defaultGameState).reduce((obj, currentKey) => {
        obj.set(currentKey, defaultGameState[currentKey].map(current => current.draw()));
        return obj;
    }, new Map<string, Array<Array<Graphics>>>());

    for (const graphicsGroup of graphicsByType.values()) {
        graphicsGroup.forEach(gg => gg.forEach(g => app.stage.addChild(g)));
    }

};

const fullscreenHandler = (): void => {
    const el: Element = document.querySelector('canvas');
    if (el.webkitRequestFullScreen) {
        el.webkitRequestFullScreen();
        el.className = 'full';
        //app.renderer.resize(window.innerWidth, window.innerHeight);
    } else {
        console.log('Full screen not supported');
    }
};

/**
 * render routine which will take the current game state and apply all
 * properties to objects visible screen
 * @param gameState
 */
function render(gameState: GameState): void {
    // Apply game state to all sets of graphics
    for (const graphicKey of graphicsByType.keys()) {
        const graphicsGroup = graphicsByType.get(graphicKey);
        gameState[graphicKey].forEach((item, index) => {
            item.applyStateToGraphics(graphicsGroup[index]);
        });
    }
}

export const pixiApp = {
    render,
    init
};
