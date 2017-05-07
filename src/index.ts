import {Observable, Scheduler} from 'rxjs';
import {defaultGameState, GameState} from './types/gameState';
import {Renderer} from './renderer';
import {keyboard$} from './observables/keyboard';
import {midiInputs$, midiInputTriggers$} from './observables/midi';
import {MIDINote} from './types/midiNote';
import MIDIInput = WebMidi.MIDIInput;
import './styles/index.css';
import './styles/fire.css';
import {GraphicTypeSelector} from "./graphicTypeSelector";

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

const renderer = new Renderer(defaultGameState, document.querySelector('.fireplace'));

const graphicTypeSelector = new GraphicTypeSelector(
    midiInputs$,
    document.querySelector('.sidebar'),
    renderer.graphicTypes
);

// Gameloop
gameLoop$.subscribe((gameState: GameState) => {
    renderer.render(gameState);
});

function mutateGameState(midiNotes: Array<MIDINote>, state: GameState, ticker: any): GameState {
    if (midiNotes.length) {
        // TODO: Make generic based on graphicTypes (from renderer)

        // Lasers
        const laserNotes = midiNotes.filter(item => item.inputId === graphicTypeSelector.graphicsMidiInputMap['lasers']);
        state.lasers.forEach((item, index) => {
            if (index + 1 <= laserNotes.length) {
                item.animate(index);
            } else if (item.isVisible) {
                item.stop(index);
            }
        });

        // Boring Boxes (note-independent, up to 3 visible at the same time)
        const boringBoxNotes = midiNotes.filter(item => item.inputId === graphicTypeSelector.graphicsMidiInputMap['boringBoxes']);
        state.boringBoxes.forEach((item, index) => {
            if (index + 1 <= boringBoxNotes.length) {
                item.animate(index);
            } else if (item.isVisible) {
                item.stop(index);
            }
        });

        // Boring Boxes (note-independent, up to 3 visible at the same time)
        const triangleNotes = midiNotes.filter(item => item.inputId === graphicTypeSelector.graphicsMidiInputMap['triangles']);
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

