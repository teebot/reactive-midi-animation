import {Base} from "./base";
import Graphics = PIXI.Graphics;

export class RetroBackground extends Base {
    width: number;
    height: number;

    private static defaults = [
        {x: 0, y: 0, width: 800, height:600, opacity: 1, lastUpdatedAt: 0, decayFor: 400, sustain: true}
    ];

    constructor(objectIndex) {
        super(
            RetroBackground.defaults[objectIndex].x,
            RetroBackground.defaults[objectIndex].y,
            RetroBackground.defaults[objectIndex].opacity,
            RetroBackground.defaults[objectIndex].lastUpdatedAt,
            RetroBackground.defaults[objectIndex].sustain,
            RetroBackground.defaults[objectIndex].decayFor
        );
        this.width = RetroBackground.defaults[objectIndex].width;
        this.height = RetroBackground.defaults[objectIndex].height;
        this.animationType = Base.ANIMATION_TYPE_SOLO;
    }

    animate(objectIndex : number) {
        super.animate(objectIndex);
        if ((this.lastUpdatedAt - this.appearedAt) < this.decayFor) {
            this.opacity = (this.lastUpdatedAt - this.appearedAt) / this.decayFor;
        } else {
            this.opacity = 1;
        }

        // If we were decaying, come back to life
        if (this.isDecaying) {
            this.isDecaying = false;
            this.lastUpdatedAt = Date.now();
            this.opacity = RetroBackground.defaults[objectIndex].opacity;
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
            this.opacity = RetroBackground.defaults[objectIndex].opacity;
            this.isVisible = false;
            this.lastUpdatedAt = 0;
            this.isDecaying = false;
        }
    }

    draw() {
        const video = document.createElement('video');
        video.preload = 'auto';
        video.loop = true;
        video.src = require('../assets/retroscape.mp4');
        const texture = PIXI.Texture.fromVideo(video);
        const videoSprite = new PIXI.Sprite(texture);
        videoSprite.width = this.width;
        videoSprite.height = this.height;
        return [videoSprite];
    }

    applyStateToGraphics(gfxObjects: Array<Graphics>): void {
        gfxObjects[0].alpha = this.isVisible ? this.opacity : 0;
        gfxObjects[0].width = this.width;
        gfxObjects[0].height = this.height;
    }
}
