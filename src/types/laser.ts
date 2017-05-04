export type Laser = {
    visible: boolean,
    keyDown: boolean,
    x1: number,
    x2: number,
    y1: number,
    y2: number,
    color: number,
    opacity: number,
    appearedAt: number,
    sustain: boolean,
    decayFor: number,
    glow: number,
    decaying: boolean
}

export const defaultLasers = [
    {visible: false, keyDown: false, x1: -25, x2: 200, y1: 0, y2: 600, color: 0xff0049, opacity: 1, appearedAt: 0, decayFor: 1000, glow: 2, sustain: true, decaying: false},
    {visible: false, keyDown: false, x1: 140, x2: 30, y1: 0, y2: 600, color: 0x00ebb3, opacity: 1, appearedAt: 0, decayFor: 1000, glow: 2, sustain: true, decaying: false},
    {visible: false, keyDown: false, x1: 320, x2: 420, y1: 0, y2: 600, color: 0x2befed, opacity: 1, appearedAt: 0, decayFor: 1000, glow: 2, sustain: true, decaying: false},
    {visible: false, keyDown: false, x1: 650, x2: 360, y1: 0, y2: 600, color: 0xc8ff00, opacity: 1, appearedAt: 0, decayFor: 1000, glow: 2, sustain: true, decaying: false},
    {visible: false, keyDown: false, x1: 700, x2: 900, y1: 0, y2: 600, color: 0xf6fc2d, opacity: 1, appearedAt: 0, decayFor: 1000, glow: 2, sustain: true, decaying: false},
    {visible: false, keyDown: false, x1: 920, x2: 600, y1: 0, y2: 600, color: 0xff891f, opacity: 1, appearedAt: 0, decayFor: 1000, glow: 2, sustain: true, decaying: false}
];

export function animateLaser(item : Laser, index : number) {
    console.log('animate');
    // Set appearedAt to NOW if key is down, and is currently decaying (bring back to life)
    if (item.decaying) {
        item.decaying = false;
        item.appearedAt = Date.now();
        item.opacity = defaultLasers[index].opacity;
    }

    // Make visible
    item.visible = true;
    const defaultGlow = defaultLasers[index].glow;
    const glowLevel = Math.round((Math.sin(Date.now() / 100) + 1) * defaultGlow);
    item.glow = glowLevel + 2;
    item.keyDown = true;

    // Set appearedAt to NOW if not set
    if (!item.appearedAt || item.appearedAt < 1) {
        item.appearedAt = Date.now();
    }

    return;
}

export function stopLaser(item : Laser, index : number) {
    console.log('stop');
    // TODO: Sustain

    item.keyDown = false;

    // Decay animation
    if (item.decayFor > 0 && item.visible && Date.now() <= item.appearedAt + item.decayFor) {
        item.decaying = true;
        item.opacity = 1 - ((Date.now() - item.appearedAt) / item.decayFor);
    }

    // Reset item values if no decay OR item has finished decaying
    if (item.visible && (!item.decayFor || item.decayFor <= 0 || Date.now() > item.appearedAt + item.decayFor)) {
        item.glow = defaultLasers[index].glow;
        item.opacity = defaultLasers[index].opacity;
        item.visible = false;
        item.appearedAt = 0;
        item.decaying = false;
    }

    return;
}
