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
    lasers: Array<Array<Graphics>>;
    boringBoxes: Array<Array<Graphics>>;
    triangles: Array<Array<Graphics>>;
    graphicTypes: Array<string>;
    canvasDomContainer: HTMLCanvasElement;

    constructor(defaultGameState, canvasDomContainer) {
        // Initialise PixiJS application
        this.defaultGameState = defaultGameState;
        this.canvasDomContainer = canvasDomContainer;
        this.app = new Application(800, 600, {backgroundColor: 0x000000});
        this.lasers = [];
        this.boringBoxes = [];
        this.triangles = [];
        this.graphicTypes = ['lasers', 'triangles', 'boringBoxes'];

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
     * - Retrieve sets of objects, which consist of one or more items (e.g. lasers require back + front lines)
     * - Store sets per category (e.g. lasers) so we can address them to apply state changes
     * - (for example, this.lasers[0] = [backLaser, frontLaser] and both are of type "Graphics"
     * - Stage all objects (by iterating over allSets we extract each object and draw it)
     */
    init(): void {
        // TODO: Make generic based on graphicTypes

        // Lasers
        this.defaultGameState.lasers.forEach(item => {
            let objects = item.draw();
            this.lasers.push(objects);
        });

        // Boring Boxes
        this.defaultGameState.boringBoxes.forEach(item => {
            let objects = item.draw();
            this.boringBoxes.push(objects);
        });

        // Triangles
        this.defaultGameState.triangles.forEach(item => {
            let objects = item.draw();
            this.triangles.push(objects);
        });

        // Combine all sets of objects
        let allSets = [...this.lasers, ...this.boringBoxes, ...this.triangles];

        // Draw all objects on screen
        allSets.forEach(set => {
            set.forEach(item => {
                this.app.stage.addChild(item);
            });
        });
    }

    render(gameState: GameState): void {
        // Apply game state to all gfx objects
        gameState.lasers.forEach((item, index) => item.applyStateToGraphics(this.lasers[index]));
        gameState.boringBoxes.forEach((item, index) => item.applyStateToGraphics(this.boringBoxes[index]));
        gameState.triangles.forEach((item, index) => item.applyStateToGraphics(this.triangles[index]));
    }
}
