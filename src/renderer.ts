import {Graphics, Application} from 'pixi.js';
import {GameState} from "./types/gameState";
export class Renderer {
    private static _renderer: Renderer;

    private circle: Graphics;

    private constructor() {
    }

    static get Instance(): Renderer {
        if (!this._renderer) {
            this._renderer = new Renderer();
        }
        return this._renderer;
    }

    public init() : void {
        const app = new Application(800, 600, {backgroundColor : 0x000000});
        document.body.appendChild(app.view);
        //Circle
        this.circle = new Graphics();
        console.log(this.circle);
        this.circle.alpha = 0;
        this.circle.beginFill(0x9966FF);
        this.circle.drawCircle(0, 0, 32);
        this.circle.endFill();
        this.circle.x = 64;
        this.circle.y = 130;
        app.stage.addChild(this.circle);

        //Rectangle
        let rectangle = new Graphics();
        rectangle.lineStyle(4, 0xFF3300, 1);
        rectangle.beginFill(0x66CCFF);
        rectangle.drawRect(0, 0, 64, 64);
        rectangle.endFill();
        rectangle.x = 170;
        rectangle.y = 170;
        app.stage.addChild(rectangle);
    }

    public render(gameState: GameState): void {
        this.circle.x = gameState.circleX;
        if (gameState.circleX > 64) {
            this.circle.alpha = 1;
        } else {
            this.circle.alpha = 0;
        }
    }
}