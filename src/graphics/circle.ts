import {Base} from "./base";
import Graphics = PIXI.Graphics;

export class Circle extends Base {
    width: number;
    color: number;

    private static defaults = [
        {x: 400, y: 300, width: 160, color: 0xCFCFCF, opacity: 1, lastUpdatedAt: 0, decayFor: 1000, sustain: true},
        {x: 400, y: 300, width: 180, color: 0xC4c4c4, opacity: 1, lastUpdatedAt: 0, decayFor: 1000, sustain: true},
        {x: 400, y: 300, width: 200, color: 0xBFBFBF, opacity: 1, lastUpdatedAt: 0, decayFor: 1000, sustain: true},
        {x: 400, y: 300, width: 220, color: 0xB4B4B4, opacity: 1, lastUpdatedAt: 0, decayFor: 1000, sustain: true},
        {x: 400, y: 300, width: 240, color: 0xAFAFAF, opacity: 1, lastUpdatedAt: 0, decayFor: 1000, sustain: true},
        {x: 400, y: 300, width: 260, color: 0xA4A4A4, opacity: 1, lastUpdatedAt: 0, decayFor: 1000, sustain: true},
        {x: 400, y: 300, width: 280, color: 0x999999, opacity: 1, lastUpdatedAt: 0, decayFor: 1000, sustain: true},
        {x: 400, y: 300, width: 300, color: 0x898989, opacity: 1, lastUpdatedAt: 0, decayFor: 1000, sustain: true}
    ];

    constructor(objectIndex) {
        super(
            Circle.defaults[objectIndex].x,
            Circle.defaults[objectIndex].y,
            Circle.defaults[objectIndex].opacity,
            Circle.defaults[objectIndex].lastUpdatedAt,
            Circle.defaults[objectIndex].sustain,
            Circle.defaults[objectIndex].decayFor
        );
        this.width = Circle.defaults[objectIndex].width;
        this.color = Circle.defaults[objectIndex].color;
        this.animationType = Base.ANIMATION_TYPE_RANDOM;
    }

    animate(objectIndex : number) {
        super.animate(objectIndex);

        // If we were decaying, come back to life
        if (this.isDecaying) {
            this.isDecaying = false;
            this.lastUpdatedAt = Date.now();
            this.opacity = Circle.defaults[objectIndex].opacity;
        }
    }

    stop(objectIndex : number) {
        super.stop(objectIndex);

        // Decay animation
        if (this.decayFor > 0 && this.isVisible && Date.now() <= this.lastUpdatedAt + this.decayFor) {
            this.isDecaying = true;
            this.opacity = 1 - ((Date.now() - this.lastUpdatedAt) / this.decayFor);
        }

        // Reset item values if no decay OR item has finished decaying
        if (this.isVisible && (!this.decayFor || this.decayFor <= 0 || Date.now() > this.lastUpdatedAt + this.decayFor)) {
            this.opacity = Circle.defaults[objectIndex].opacity;
            this.isVisible = false;
            this.lastUpdatedAt = 0;
            this.isDecaying = false;
        }
    }

    draw() {
        const Circle = new Graphics();
        Circle.lineStyle(5, this.color, this.opacity);
        Circle.beginFill(this.color, 0);
        Circle.drawCircle(this.x, this.y, this.width);
        Circle.alpha = 0;
        Circle.endFill();
        return [Circle];
    }

    applyStateToGraphics(gfxObjects: Array<Graphics>): void {
        gfxObjects[0].alpha = this.isVisible ? this.opacity : 0;
    }
}
