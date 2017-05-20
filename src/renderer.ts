import {Application} from 'pixi.js';
import {GameState} from './types/gameState';
import Graphics = PIXI.Graphics;

let graphicsByType: Map<string, Array<Array<Graphics>>>;
const app = new Application(800, 600, {backgroundColor: 0x000000});

const video = document.createElement('video');
video.preload = 'auto';
video.loop = true;
video.src = require('./assets/retroscape.mp4');
const texture = PIXI.Texture.fromVideo(video);
const videoSprite = new PIXI.Sprite(texture);
videoSprite.width = app.renderer.width;
videoSprite.height = app.renderer.height;

/**
 * initialises all possible graphics based visible the default game state
 * @param canvasDomContainer
 * @param defaultGameState
 */
const init = (canvasDomContainer: Element, defaultGameState: GameState): void => {
    canvasDomContainer.appendChild(app.view);
    canvasDomContainer.querySelector('canvas').addEventListener('dblclick', fullscreenHandler);


    app.stage.addChild(videoSprite);

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
