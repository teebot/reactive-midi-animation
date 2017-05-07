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

const renderer = new Renderer(
    defaultGameState,
    document.querySelector('.fireplace')
);

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
        renderer.graphicTypes.forEach(graphicType => {
            const graphicNotes = midiNotes.filter(i => i.inputId === graphicTypeSelector.graphicsMidiInputMap[graphicType]);
            state[graphicType].forEach((item, index) => {
                // TODO: Animate in different ways (key-note map, etc.)
                if (index + 1 <= graphicNotes.length) {
                    item.animate(index);
                } else if (item.isVisible) {
                    item.stop(index);
                }
            });
        });

    } else {
        // Initiate stop animation for all visible objects
        renderer.graphicTypes.forEach(graphicType => {
            state[graphicType].filter(item => item.isVisible).forEach((item, index) => item.stop(index));
        });
    }
    return state;
}

