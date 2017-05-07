import {Graphics, Application} from 'pixi.js';
import {GameState} from './types/gameState';

/**
 * This class initialises all possible graphics based visible the default game state
 * And implements a render routine which will take the current game state and apply all
 * properties to objects visible screen
 */
export class Renderer {
    defaultGameState: GameState;
    app: Application;
    graphicTypes: Array<string>;
    graphics: any; // Object where key is type, value = sets of graphics containing individual graphics
    canvasDomContainer: HTMLCanvasElement;

    constructor(defaultGameState, canvasDomContainer) {
        // Initialise PixiJS application
        this.defaultGameState = defaultGameState;
        this.canvasDomContainer = canvasDomContainer;
        this.app = new Application(800, 600, {backgroundColor: 0x000000});
        this.graphicTypes = ['lasers', 'triangles', 'boringBoxes'];
        this.graphics = []; // e.g. {'lasers': [[backLine, frontLine],[backLine,frontLine]]}

        // Render canvas element and all graphics
        this.canvasDomContainer.appendChild(this.app.view);
        this.init();

        // Add full screen handler
        this.canvasDomContainer.querySelector('canvas').addEventListener('dblclick', this.fullscreenHandler);
    }

    fullscreenHandler(): void {
        const el = document.querySelector('canvas');
        if(el.webkitRequestFullScreen) {
            el.webkitRequestFullScreen();
        } else {
            console.log('Full screen not supported')
        }
    }

    /**
     * Draw all objects on screen based on the default game state:
     * Retrieve sets of objects, which consist of one or more items (e.g. lasers require back + front lines)
     * Store sets per category (e.g. lasers) so we can address them to apply state changes (in the render function)
     */
    init(): void {
        this.graphicTypes.forEach(graphicType => {
            this.graphics[graphicType] = [];
            this.defaultGameState[graphicType].forEach(item => {
                let objects = item.draw();
                this.graphics[graphicType].push(objects);
                objects.forEach(graphic => this.app.stage.addChild(graphic));
            });
        });
    }

    render(gameState: GameState): void {
        // Apply game state to all sets of graphics
        Object.keys(this.graphics).forEach(graphicType => {
            gameState[graphicType].forEach((item, index) => {
                item.applyStateToGraphics(this.graphics[graphicType][index]);
            });
        });
    }
}
