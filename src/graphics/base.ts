import Graphics = PIXI.Graphics;

export abstract class Base {

    // State
    isVisible: boolean;
    isKeyDown: boolean;
    isDecaying: boolean;

    // Animation types (const)
    static ANIMATION_TYPE_STACK = 'stack'; // If first item is visible or decaying, animate second item, etc.
    static ANIMATION_TYPE_PIANO = 'piano'; // Map notes to objects (e.g. 12 lines = 12 notes)
    static ANIMATION_TYPE_AMOUNT = 'amount'; // Based on the amount of keys pressed (in order)
    static ANIMATION_TYPE_RANDOM = 'random'; // Animate any non-visible non-decaying object
    static ANIMATION_TYPE_SOLO = 'solo'; // Always trigger the same object (e.g. for a "kick" effect)
    animationType: string;

    constructor(
        public x: number,
        public y: number,
        public opacity: number,
        public appearedAt: number,
        public sustain: boolean,
        public decayFor: number
    ) {
        this.isVisible = false;
        this.isKeyDown = false;
        this.isDecaying = false;
        this.animationType = Base.ANIMATION_TYPE_RANDOM; // Default = random, unless overridden
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

    applyStateToGraphics(gfxObjects: Array<Graphics>): void {
        return;
    }
}
