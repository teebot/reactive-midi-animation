import {Observable, Scheduler} from 'rxjs';
import {defaultGameState, GameState} from './types/gameState';
import {Renderer} from './renderer';
import {keyboard$} from './observables/keyboard';
import {midiInputs$, midiInputTriggers$} from './observables/midi';
import {MIDINote} from './types/midiNote';
import MIDIInput = WebMidi.MIDIInput;

const TICKER_INTERVAL = 17;
const ticker$ = Observable
    .interval(TICKER_INTERVAL, Scheduler.animationFrame)
    .map(() => ({
        time: Date.now(),
        deltaTime: null
    }))
    .scan(
        (previous, current) => ({
            time: current.time,
            deltaTime: (current.time - previous.time) / 1000
        })
    );

const midi$ = Observable.merge(keyboard$, midiInputTriggers$);

// defaultGameState object will mutate, so we keep a copy here to restore default values when needed
const defaultGameStateClone = JSON.parse(JSON.stringify(defaultGameState));

const gameLoop$ = ticker$.combineLatest(midi$)
    .scan((state: GameState, [ticker, midiNotes]) =>
            mutateGameState(midiNotes, state, ticker)
        , defaultGameState);

const renderer = new Renderer(defaultGameState, document.body);

// Gameloop
gameLoop$.subscribe((gameState: GameState) => {
    renderer.render(gameState);
});

// Print midi inputs
midiInputs$.subscribe((inputs: Array<MIDIInput>) => {
    const element = document.querySelector('.input-names');
    element.textContent = inputs.map(i => i.name).join('/');
});

function mutateGameState(midiNotes: Array<MIDINote>, state: GameState, ticker: any): GameState {
    const keyColors = {
        'C': 0x9966FF,
        'D': 0xFF0000,
        'E': 0x00FF00,
        'F': 0x0000FF,
    };
    if (midiNotes.length) {
        state.circleX += ticker.deltaTime * 100;
        state.color = keyColors[midiNotes[0].note.key] || 0x9966FF;

        state.lasers.forEach((item, index) => {
            if (index + 1 <= midiNotes.length) {
                // Set appearedAt to NOW if key is down, and is currently decaying (bring back to life)
                if (state.lasers[index].decaying) {
                    state.lasers[index].decaying = false;
                    state.lasers[index].appearedAt = Date.now();
                    state.lasers[index].opacity = defaultGameStateClone.lasers[index].opacity;
                }

                // Make visible
                state.lasers[index].visible = true;
                const defaultGlow = defaultGameStateClone.lasers[index].glow;
                const glowLevel = Math.round((Math.sin(Date.now() / 100) + 1) * defaultGlow);
                state.lasers[index].glow = glowLevel + 2;
                state.lasers[index].keyDown = true;

                // Set appearedAt to NOW if not set
                if (!state.lasers[index].appearedAt || state.lasers[index].appearedAt < 1) {
                    state.lasers[index].appearedAt = Date.now();
                }

            } else {
                killOverTime(state.lasers[index], defaultGameStateClone.lasers[index]);
            }
        });
    } else {
        state.circleX = 64;
        state.color = 0x9966FF;
        state.lasers.forEach((item, index) => {
            // Turn them off
            if (state.lasers[index].visible) {
                killOverTime(state.lasers[index], defaultGameStateClone.lasers[index]);
            }
        });
    }
    return state;
}

function killOverTime(item, defaultItem) {
    item.keyDown = false;

    // Decay animation
    if (item.decayFor > 0 && item.visible && Date.now() <= item.appearedAt + item.decayFor) {
        item.decaying = true;
        item.opacity = 1 - ((Date.now() - item.appearedAt) / item.decayFor);
    }

    // Reset item values if no decay OR item has finished decaying
    if (item.visible && (!item.decayFor || item.decayFor <= 0 || Date.now() > item.appearedAt + item.decayFor)) {
        item.glow = defaultItem.glow;
        item.opacity = defaultItem.opacity;
        item.visible = false;
        item.appearedAt = 0;
        item.decaying = false;
    }
}
