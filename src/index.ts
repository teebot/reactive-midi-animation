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
    // TODO: Map keys to lasers and store which ones are on in an array or stream?
    // TODO: Bring back the ticker (from the circle example) + check that example to see how we map keys!

    if (midiNotes.length) {
        state.lasers.forEach((item, index) => {
            if (index + 1 <= midiNotes.length) {
                // TODO: Remove this once we have solved previous todo
                // Start or continue animation
                item.animate(index);

            } else {
                // Decay
                if (item.visible) {
                    // TODO: Remove this once we have solved previous todo
                    item.stop(index);
                }
            }
        });
    } else {
        // Kill all visible lasers
        state.lasers.filter(laser => laser.visible).forEach((item, index) => item.stop(index));
    }
    return state;
}

