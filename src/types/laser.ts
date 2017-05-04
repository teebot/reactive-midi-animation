export class Laser {
    visible: boolean;
    keyDown: boolean;
    x1: number;
    x2: number;
    y1: number;
    y2: number;
    color: number;
    opacity: number;
    appearedAt: number;
    sustain: boolean;
    decayFor: number;
    glow: number;
    decaying: boolean;

    private defaults = [
        {visible: false, keyDown: false, x1: -25, x2: 200, y1: 0, y2: 600, color: 0xff0049, opacity: 1, appearedAt: 0, decayFor: 1000, glow: 2, sustain: true, decaying: false},
        {visible: false, keyDown: false, x1: 140, x2: 30, y1: 0, y2: 600, color: 0x00ebb3, opacity: 1, appearedAt: 0, decayFor: 1000, glow: 2, sustain: true, decaying: false},
        {visible: false, keyDown: false, x1: 320, x2: 420, y1: 0, y2: 600, color: 0x2befed, opacity: 1, appearedAt: 0, decayFor: 1000, glow: 2, sustain: true, decaying: false},
        {visible: false, keyDown: false, x1: 650, x2: 360, y1: 0, y2: 600, color: 0xc8ff00, opacity: 1, appearedAt: 0, decayFor: 1000, glow: 2, sustain: true, decaying: false},
        {visible: false, keyDown: false, x1: 700, x2: 900, y1: 0, y2: 600, color: 0xf6fc2d, opacity: 1, appearedAt: 0, decayFor: 1000, glow: 2, sustain: true, decaying: false},
        {visible: false, keyDown: false, x1: 920, x2: 600, y1: 0, y2: 600, color: 0xff891f, opacity: 1, appearedAt: 0, decayFor: 1000, glow: 2, sustain: true, decaying: false}
    ];

    constructor(objectIndex) {
        this.visible = this.defaults[objectIndex].visible;
        this.keyDown = this.defaults[objectIndex].keyDown;
        this.x1 = this.defaults[objectIndex].x1;
        this.x2 = this.defaults[objectIndex].x2;
        this.y1  = this.defaults[objectIndex].y1;
        this.y2 = this.defaults[objectIndex].y2;
        this.color = this.defaults[objectIndex].color;
        this.opacity = this.defaults[objectIndex].opacity;
        this.appearedAt = this.defaults[objectIndex].appearedAt;
        this.decayFor = this.defaults[objectIndex].decayFor;
        this.glow = this.defaults[objectIndex].glow;
        this.sustain = this.defaults[objectIndex].sustain;
        this.decaying = this.defaults[objectIndex].decaying;
    }

    animate(objectIndex : number) {
        console.log('animate');

        // If we were decaying, come back to life
        if (this.decaying) {
            this.decaying = false;
            this.appearedAt = Date.now();
            this.opacity = this.defaults[objectIndex].opacity;
        }

        // Make visible
        this.visible = true;
        const defaultGlow = this.defaults[objectIndex].glow;
        const glowLevel = Math.round((Math.sin(Date.now() / 100) + 1) * defaultGlow);
        this.glow = glowLevel + 2;
        this.keyDown = true;

        // Always set appeared at to the current time (TODO: maybe change the name?)
        this.appearedAt = Date.now();
    }

    stop(objectIndex : number) {
        console.log('stop');
        // TODO: Sustain
        this.keyDown = false;

        // Decay animation
        if (this.decayFor > 0 && this.visible && Date.now() <= this.appearedAt + this.decayFor) {
            this.decaying = true;
            this.opacity = 1 - ((Date.now() - this.appearedAt) / this.decayFor);
        }

        // Reset item values if no decay OR item has finished decaying
        if (this.visible && (!this.decayFor || this.decayFor <= 0 || Date.now() > this.appearedAt + this.decayFor)) {
            this.glow = this.defaults[objectIndex].glow;
            this.opacity = this.defaults[objectIndex].opacity;
            this.visible = false;
            this.appearedAt = 0;
            this.decaying = false;
        }
    }
}
