import {Observable, Scheduler} from 'rxjs';
import {defaultGameState, GameState} from './types/gameState';
import {Renderer} from './renderer';
import {keyboard$} from './observables/keyboard';
import {midiInputs$, midiInputTriggers$} from './observables/midi';
import {MIDINote} from './types/midiNote';
import MIDIInput = WebMidi.MIDIInput;
import {animateLaser, stopLaser} from "./types/laser";

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
                // Start or continue animation
                animateLaser(item, index);

            } else {
                // Decay
                if (item.visible) {
                    stopLaser(item, index);
                }
            }
        });
    } else {
        state.circleX = 64;
        state.color = 0x9966FF;
        state.lasers.forEach((item, index) => {
            // Decay all
            if (item.visible) {
                stopLaser(item, index);
            }
        });
    }
    return state;
}

