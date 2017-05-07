import {Base} from "./base";
import {filters} from "pixi.js";
import Graphics = PIXI.Graphics;

export class Laser extends Base {
    x2: number;
    y2: number;
    color: number;
    glow: number;

    private static defaults = [
        {x: -25, x2: 200, y: 0, y2: 600, color: 0xff0049, opacity: 1, appearedAt: 0, decayFor: 1000, glow: 2, sustain: true},
        {x: 140, x2: 30, y: 0, y2: 600, color: 0x00ebb3, opacity: 1, appearedAt: 0, decayFor: 1000, glow: 2, sustain: true},
        {x: 320, x2: 420, y: 0, y2: 600, color: 0x2befed, opacity: 1, appearedAt: 0, decayFor: 1000, glow: 2, sustain: true},
        {x: 650, x2: 360, y: 0, y2: 600, color: 0xc8ff00, opacity: 1, appearedAt: 0, decayFor: 1000, glow: 2, sustain: true},
        {x: 700, x2: 900, y: 0, y2: 600, color: 0xf6fc2d, opacity: 1, appearedAt: 0, decayFor: 1000, glow: 2, sustain: true},
        {x: 920, x2: 600, y: 0, y2: 600, color: 0xff891f, opacity: 1, appearedAt: 0, decayFor: 1000, glow: 2, sustain: true}
    ];

    constructor(objectIndex) {
        super(
            Laser.defaults[objectIndex].x,
            Laser.defaults[objectIndex].y,
            Laser.defaults[objectIndex].opacity,
            Laser.defaults[objectIndex].appearedAt,
            Laser.defaults[objectIndex].sustain,
            Laser.defaults[objectIndex].decayFor
        );
        this.x2 = Laser.defaults[objectIndex].x2;
        this.y2 = Laser.defaults[objectIndex].y2;
        this.color = Laser.defaults[objectIndex].color;
        this.glow = Laser.defaults[objectIndex].glow;
        this.animationType = Base.ANIMATION_TYPE_RANDOM;
    }

    animate(objectIndex : number) {
        super.animate(objectIndex);

        // If we were decaying, come back to life
        if (this.isDecaying) {
            this.isDecaying = false;
            this.appearedAt = Date.now();
            this.opacity = Laser.defaults[objectIndex].opacity;
        }

        const defaultGlow = Laser.defaults[objectIndex].glow;
        const glowLevel = Math.round((Math.sin(Date.now() / 100) + 1) * defaultGlow);
        this.glow = glowLevel + 2;
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
            this.glow = Laser.defaults[objectIndex].glow;
            this.opacity = Laser.defaults[objectIndex].opacity;
            this.isVisible = false;
            this.appearedAt = 0;
            this.isDecaying = false;
        }
    }

    draw() {
        const backLine = new Graphics();
        backLine.lineStyle(4, this.color, this.opacity);
        backLine.moveTo(this.x, this.y);
        backLine.lineTo(this.x2, this.y2);
        backLine.alpha = 0;
        const dropShadowFilter = new filters.BlurFilter();
        dropShadowFilter.blur = 6;
        backLine.filters = [dropShadowFilter];

        const frontLine = new Graphics();
        frontLine.lineStyle(4, this.color, this.opacity);
        frontLine.moveTo(this.x, this.y);
        frontLine.lineTo(this.x2, this.y2);
        frontLine.alpha = 0;

        return [backLine, frontLine];
    }

    applyStateToGraphics(gfxObjects: Array<Graphics>) {
        gfxObjects[0].alpha = this.isVisible ? this.opacity : 0; // backLine
        gfxObjects[0].filters[0]["blur"] = this.glow; // backLine
        gfxObjects[1].alpha = this.isVisible ? this.opacity : 0; // frontLine
    }
}
