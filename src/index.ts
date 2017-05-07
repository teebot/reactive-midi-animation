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

// Map graphics to MIDI inputs (e.g. lasers or boxes) TODO: Make this dynamic, so we can swap them on runtime
const graphicsMidiInputMap = {};
const unassignedGraphics = ['lasers', 'triangles', 'boringBoxes'];

// Print midi inputs and assign to map
midiInputs$.subscribe((inputs: Array<MIDIInput>) => {
    const element = document.querySelector('.input-names');
    element.textContent = inputs.map(i => i.name).join(', ');
    inputs.forEach(input => {
        if (unassignedGraphics.length) {
            graphicsMidiInputMap[unassignedGraphics.pop()] = input.id; // e.g. lasers: 123901
        }
    });
});

function mutateGameState(midiNotes: Array<MIDINote>, state: GameState, ticker: any): GameState {
    if (midiNotes.length) {
        // Lasers
        const laserNotes = midiNotes.filter(item => item.inputId === graphicsMidiInputMap['lasers']);
        state.lasers.forEach((item, index) => {
            if (index + 1 <= laserNotes.length) {
                item.animate(index);
            } else if (item.isVisible) {
                item.stop(index);
            }
        });

        // Boring Boxes (note-independent, up to 3 visible at the same time)
        const boringBoxNotes = midiNotes.filter(item => item.inputId === graphicsMidiInputMap['boringBoxes']);
        state.boringBoxes.forEach((item, index) => {
            if (index + 1 <= boringBoxNotes.length) {
                item.animate(index);
            } else if (item.isVisible) {
                item.stop(index);
            }
        });

        // Boring Boxes (note-independent, up to 3 visible at the same time)
        const triangleNotes = midiNotes.filter(item => item.inputId === graphicsMidiInputMap['triangles']);
        state.triangles.forEach((item, index) => {
            if (index + 1 <= triangleNotes.length) {
                item.animate(index);
            } else if (item.isVisible) {
                item.stop(index);
            }
        });

    } else {
        // Initiate stop animation for all visible objects
        state.lasers.filter(item => item.isVisible).forEach((item, index) => item.stop(index));
        state.boringBoxes.filter(item => item.isVisible).forEach((item, index) => item.stop(index));
        state.triangles.filter(item => item.isVisible).forEach((item, index) => item.stop(index));
    }
    return state;
}

