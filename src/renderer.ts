import {Application} from 'pixi.js';
import {GameState} from './types/gameState';
import Graphics = PIXI.Graphics;

/**
 * This class initialises all possible graphics based visible the default game state
 * And implements a render routine which will take the current game state and apply all
 * properties to objects visible screen
 */
export class Renderer {
    app: Application;
    graphicTypes: Array<string>;
    graphics: { [key: string]: Array<Graphics> }; // Object where key is type, value = sets of graphics containing individual graphics

    constructor(private defaultGameState, private canvasDomContainer) {
        // Initialise PixiJS application
        this.app = new Application(800, 600, {backgroundColor: 0x000000});
        this.graphicTypes = ['lasers', 'triangles', 'boringBoxes'];
        this.graphics = {}; // e.g. {'lasers': [[backLine, frontLine],[backLine,frontLine]]}

        // Render canvas element and all graphics
        this.canvasDomContainer.appendChild(this.app.view);
        // this.init();

        // Add full screen handler
        this.canvasDomContainer.querySelector('canvas').addEventListener('dblclick', Renderer.fullscreenHandler);
    }

    static fullscreenHandler(): void {
        const el: Element = document.querySelector('canvas');
        if(el.webkitRequestFullScreen) {
            el.webkitRequestFullScreen();
        } else {
            console.log('Full screen not supported');
        }
    }

    /**
     * Draw all objects on screen based on the default game state:
     * Retrieve sets of objects, which consist of one or more items (e.g. lasers require back + front lines)
     * Store sets per category (e.g. lasers) so we can address them to apply state changes (in the render function)
     */
    init(): void {
        // each graphic name from graphicType
        // will be a key
        // in graphics { key: <Graphics>[], }

        // default game state is { key: <Base>[]}
        // we initiate by setting each key to every individual Graphic from Base.draw() (Laser/Triangle/Box)
        // and add each of them to the stage

        // this.graphicTypes.forEach(graphicType => {
        //     this.graphics[graphicType] = [];
        //     this.defaultGameState[graphicType].forEach(item => {
        //         let objects = item.draw();
        //         this.graphics[graphicType].push(objects);
        //         objects.forEach(graphic => this.app.stage.addChild(graphic));
        //     });
        // });
    }

    render(gameState: GameState, graphics: { [key: string]: Array<Graphics> }): { [key: string]: Array<Graphics> } {
        // Apply game state to all sets of graphics
        Object.keys(graphics).forEach(graphicType => {
            gameState[graphicType].forEach((item, index) => {
                item.applyStateToGraphics(graphics[graphicType][index]);
            });
        });
        return graphics;
    }
}
