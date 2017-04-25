import {Graphics, Application} from 'pixi.js';
import {GameState} from './types/gameState';

const app = new Application(800, 600, {backgroundColor: 0x000000});
document.body.appendChild(app.view);

let circle: Graphics;
init();

function init(): void {
    //Circle
    circle = new Graphics();
    circle.alpha = 0;
    circle.beginFill(0x9966FF);
    circle.drawCircle(0, 0, 32);
    circle.endFill();
    circle.x = 64;
    circle.y = 130;
    app.stage.addChild(circle);

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

export function render(gameState: GameState): void {
    circle.x = gameState.circleX;
    if (gameState.circleX > 64) {
        circle.alpha = 1;
        circle.tint = gameState.color;
    } else {
        circle.alpha = 0;
    }
}