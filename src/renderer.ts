import {Graphics, Application, filters} from 'pixi.js';
import {GameState} from './types/gameState';

/**
 * This class initialises all possible graphics based visible the default game state
 * And implements a render routine which will take the current game state and apply all
 * properties to objects visible screen
 */
export class Renderer {
    defaultGameState: GameState;
    circle: Graphics;
    app: Application;
    lasers: Array<Array<Graphics>>;

    constructor(defaultGameState, domElement) {
        // Initialise PixiJS application
        this.defaultGameState = defaultGameState;
        this.app = new Application(800, 600, {backgroundColor: 0x000000});
        this.lasers = [];
        domElement.appendChild(this.app.view);
        this.init();
    }

    init(): void {
        // Temporary (TODO remove)
        this.circle = new Graphics();
        this.circle.alpha = 0;
        this.circle.beginFill(0x9966FF);
        this.circle.drawCircle(0, 0, 32);
        this.circle.endFill();
        this.circle.x = 64;
        this.circle.y = 130;
        this.app.stage.addChild(this.circle);

        // Draw lines (based on default gamestate)
        this.defaultGameState.lasers.forEach(item => {
            const backLine = new Graphics();
            backLine.lineStyle(4, item.color, item.opacity);
            backLine.moveTo(item.x1, item.y1);
            backLine.lineTo(item.x2, item.y2);
            const dropShadowFilter = new filters.BlurFilter();
            dropShadowFilter.blur = 6;
            backLine.filters = [dropShadowFilter];

            const frontLine = new Graphics();
            frontLine.lineStyle(4, item.color, item.opacity);
            frontLine.moveTo(item.x1, item.y1);
            frontLine.lineTo(item.x2, item.y2);

            this.lasers.push([backLine, frontLine]);
            this.app.stage.addChild(this.lasers[this.lasers.length - 1][0]); // backLine
            this.app.stage.addChild(this.lasers[this.lasers.length - 1][1]); // frontLine
        });
    }

    render(gameState: GameState): void {
        // Apply game state to graphics
        this.circle.x = gameState.circleX;
        if (gameState.circleX > 64) {
            this.circle.alpha = 1;
            this.circle.tint = gameState.color;
        } else {
            this.circle.alpha = 0;
        }

        // Lines
        gameState.lasers.forEach((item, index) => {
            this.lasers[index][0].alpha = item.visible ? item.opacity : 0; // backLine
            this.lasers[index][0].filters[0]["blur"] = item.glow;     // backLine
            this.lasers[index][1].alpha = item.visible ? item.opacity : 0; // frontLine
        });
    }
}
