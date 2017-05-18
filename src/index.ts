import {Observable, Scheduler} from 'rxjs';
import {defaultGameState, GameState} from './types/gameState';
import {pixiApp} from './renderer';
import {keyboard$} from './observables/keyboard';
import {midiInputs$, midiInputTriggers$} from './observables/midi';
import MIDIInput = WebMidi.MIDIInput;
import './styles/index.css';
import './styles/fire.css';
import {getGraphicTypeSelection} from './observables/graphicTypeSelector';
import {mutateGameState} from './state/index';

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

const graphicMapping$ = midiInputs$.flatMap(midiInputs =>
    getGraphicTypeSelection(midiInputs, document.querySelector('.sidebar'))
);

const midi$ = Observable.merge(keyboard$, midiInputTriggers$);

pixiApp.init(document.querySelector('.fireplace'), defaultGameState);
const gameLoop$ = ticker$.combineLatest(midi$, graphicMapping$)
    .scan((state: GameState, [ticker, midiNotes, graphicMapping]) =>
            mutateGameState(state, midiNotes, ticker, graphicMapping)
        , defaultGameState);

// Gameloop
gameLoop$
    .subscribe((gameState: GameState) => {
        pixiApp.render(gameState);
});
