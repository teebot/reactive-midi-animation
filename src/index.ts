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
    // TODO: Map keys to lasers and store which ones are on in an array or stream (using a map of keys: gfx objects)

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

        // TODO: Dealing with an issue right now when you press keys on both a midi input and the keyboard,
        // the stream no longer contains one or the other and stops animating them
        console.log(laserNotes.length, boringBoxNotes.length, triangleNotes.length);

        // TODO: I should be able to still call animate if key is still down, remember which ones are animating!
        /*state.boringBoxes.forEach((item, index) => {
            // Loop over notes being played
            let animatingThisIndex = false;
            boringBoxNotes.forEach(note => {
                // If not currently animating this note
                if (boringBoxNotes.length && !((note.note.key + note.note.octave) in animatingBoxNotes)) {
                    // Add it to the list of things to start (or keep on) animating
                    animatingBoxNotes[note.note.key + note.note.octave] = index;
                    animatingThisIndex = true;
                }
            });

            if (!animatingThisIndex && item.isVisible) {
                item.stop(index);
            }
        });

        Object.keys(animatingBoxNotes).forEach(key => {
            const index = animatingBoxNotes[key];
            state.boringBoxes[index].animate(index)

        });*/

    } else {
        // Initiate stop animation for all visible objects
        state.lasers.filter(item => item.isVisible).forEach((item, index) => item.stop(index));
        state.boringBoxes.filter(item => item.isVisible).forEach((item, index) => item.stop(index));
        state.triangles.filter(item => item.isVisible).forEach((item, index) => item.stop(index));
    }
    return state;
}

