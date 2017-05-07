import {Base} from "./base";
import Graphics = PIXI.Graphics;

export class Triangle extends Base {
    width: number;
    height: number;
    color: number;

    private static defaults = [
        {x: 400, y: 300, width: 100, height: 100, color: 0xAA0000, opacity: 1, appearedAt: 0, decayFor: 1000, sustain: true},
        {x: 400, y: 290, width: 120, height: 120, color: 0xCC0000, opacity: 1, appearedAt: 0, decayFor: 1000, sustain: true},
        {x: 400, y: 280, width: 140, height: 140, color: 0xFF0000, opacity: 1, appearedAt: 0, decayFor: 1000, sustain: true}
    ];

    constructor(objectIndex) {
        super(
            Triangle.defaults[objectIndex].x,
            Triangle.defaults[objectIndex].y,
            Triangle.defaults[objectIndex].opacity,
            Triangle.defaults[objectIndex].appearedAt,
            Triangle.defaults[objectIndex].sustain,
            Triangle.defaults[objectIndex].decayFor
        );
        this.width = Triangle.defaults[objectIndex].width;
        this.height = Triangle.defaults[objectIndex].height;
        this.color = Triangle.defaults[objectIndex].color;
    }

    animate(objectIndex : number) {
        super.animate(objectIndex);

        // If we were decaying, come back to life
        if (this.isDecaying) {
            this.isDecaying = false;
            this.appearedAt = Date.now();
            this.opacity = Triangle.defaults[objectIndex].opacity;
        }
    }

    stop(objectIndex : number) {
        super.stop(objectIndex);

        // Decay animation
        if (this.decayFor > 0 && this.isVisible && Date.now() <= this.appearedAt + this.decayFor) {
            this.isDecaying = true;
            this.opacity = 1 - ((Date.now() - this.appearedAt) / this.decayFor);
        }

        // Reset item values if no decay OR item has finished decaying
        if (this.isVisible && (!this.decayFor || this.decayFor <= 0 || Date.now() > this.appearedAt + this.decayFor)) {
            this.opacity = Triangle.defaults[objectIndex].opacity;
            this.isVisible = false;
            this.appearedAt = 0;
            this.isDecaying = false;
        }
    }

    draw() {
        const triangle = new Graphics();
        triangle.lineStyle(8, this.color, this.opacity);
        triangle.beginFill(this.color, 0);
        triangle.drawPolygon([
            this.x, this.y - Math.round(this.height / 2),
            this.x + Math.round(this.width / 2), this.y + Math.round(this.height / 2),
            this.x - Math.round(this.width / 2), this.y + Math.round(this.height / 2)
        ]);
        triangle.alpha = 0;
        triangle.endFill();
        return [triangle];
    }

    applyStateToGraphics(gfxObjects: Array<Graphics>) {
        gfxObjects[0].alpha = this.isVisible ? this.opacity : 0;
    }
}
