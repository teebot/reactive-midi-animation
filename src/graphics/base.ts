import Graphics = PIXI.Graphics;

export abstract class Base {
    x: number;
    y: number;
    opacity: number;
    appearedAt: number;
    sustain: boolean;
    decayFor: number;

    // State
    isVisible: boolean;
    isKeyDown: boolean;
    isDecaying: boolean;

    constructor(
        x: number,
        y: number,
        opacity: number,
        appearedAt: number,
        sustain: boolean,
        decayFor: number
    ) {
        this.x = x;
        this.y  = y;
        this.opacity = opacity;
        this.appearedAt = appearedAt;
        this.decayFor = decayFor;
        this.sustain = sustain;
        this.isVisible = false;
        this.isKeyDown = false;
        this.isDecaying = false;
    }

    animate(objectIndex : number) {
        this.isVisible = true;
        this.isKeyDown = true;

        // Always set appeared at to the current time (TODO: maybe change the name?)
        this.appearedAt = Date.now();
        return;
    }

    stop(objectIndex : number) {
        // TODO: Sustain
        this.isKeyDown = false;

        return;
    }

    draw() : Array<Graphics> {
        return [];
    }

    applyStateToGraphics(gfxObjects: Array<Graphics>) {
        return;
    }
}
