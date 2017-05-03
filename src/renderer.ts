import {Graphics, Application} from 'pixi.js';
import {GameState} from './types/gameState';

/**
 * This class initialises all possible graphics based on the default game state
 * And implements a render routine which will take the current game state and apply all
 * properties to objects on screen
 */
export class Renderer {
    defaultGameState: GameState;
    circle: Graphics;
    app: Application;
    lines: Array<Graphics>;

    constructor(defaultGameState, domElement) {
        // Initialise PixiJS application
        this.defaultGameState = defaultGameState;
        this.app = new Application(800, 600, {backgroundColor: 0x000000});
        this.lines = [];
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

        // Initialise lines (based on default gamestate)
        this.defaultGameState.lines.forEach(line => {
            let newLine = new Graphics();
            newLine.lineStyle(4, line.color, line.opacity);
            newLine.moveTo(line.x1, line.y1);
            newLine.lineTo(line.x2, line.y2);
            this.lines.push(newLine);
            this.app.stage.addChild(this.lines[this.lines.length - 1]);
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
        gameState.lines.forEach((line, index) => {
            this.lines[index].alpha = line.on ? line.opacity : 0;
        });
    }
}
