import {Base} from "./base";
import Graphics = PIXI.Graphics;

export class BoringBox extends Base {
    x2: number;
    y2: number;

    private static defaults = [
        {x: 200, x2: 600, y: 100, y2: 500, opacity: 1, appearedAt: 0, decayFor: 1000, sustain: true},
        {x: 210, x2: 590, y: 110, y2: 490, opacity: 1, appearedAt: 0, decayFor: 1000, sustain: true}
    ];

    constructor(objectIndex) {
        super(
            BoringBox.defaults[objectIndex].x,
            BoringBox.defaults[objectIndex].y,
            BoringBox.defaults[objectIndex].opacity,
            BoringBox.defaults[objectIndex].appearedAt,
            BoringBox.defaults[objectIndex].sustain,
            BoringBox.defaults[objectIndex].decayFor
        );
        this.x2 = BoringBox.defaults[objectIndex].x2;
        this.y2 = BoringBox.defaults[objectIndex].y2;
    }

    animate(objectIndex : number) {
        super.animate(objectIndex);

        // If we were decaying, come back to life
        if (this.isDecaying) {
            this.isDecaying = false;
            this.appearedAt = Date.now();
            this.opacity = BoringBox.defaults[objectIndex].opacity;
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
            this.opacity = BoringBox.defaults[objectIndex].opacity;
            this.isVisible = false;
            this.appearedAt = 0;
            this.isDecaying = false;
        }
    }

    draw() {
        const box = new Graphics();
        box.lineStyle(8, 0xFFFFFF, this.opacity);
        box.beginFill(0x66CCFF, 0);
        box.drawRect(this.x, this.y, this.x2 - this.x, this.y2 - this.y);
        box.endFill();
        return [box];
    }

    applyStateToGraphics(gfxObjects: Array<Graphics>) {
        gfxObjects[0].alpha = this.isVisible ? this.opacity : 0;
    }
}
