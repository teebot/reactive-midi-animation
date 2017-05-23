import {Observable, Scheduler} from 'rxjs';
import {defaultGameState, GameState} from './types/gameState';
import {pixiApp} from './renderer';
import {keyboard$} from './observables/keyboard';
import {midiInputs$, midiInputTriggers$, midiOutput$, midiOutSubject$} from './observables/midi';
import MIDIInput = WebMidi.MIDIInput;
import '../node_modules/skeleton-css/css/skeleton.css';
import './styles/index.css';
import './styles/fire.css';
import {getGraphicTypeSelection} from './observables/graphicTypeSelector';
import {mutateGameState} from './state/index';
import MIDIOutput = WebMidi.MIDIOutput;
import {DMX_CONSTANTS} from './dmxConstants';

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

const graphicMapping$ = Observable.combineLatest(midiInputs$, midiOutput$).flatMap(([midiInputs, midiOutpus]) => {
    return getGraphicTypeSelection(midiInputs, document.querySelector('.sidebar'));
});

const midi$ = Observable.merge(keyboard$, midiInputTriggers$);

const gameLoop$ = ticker$.combineLatest(midi$, graphicMapping$)
    .do(([ticker, midiNotes, graphicMapping]) => {
        midiOutSubject$.next({midiNotes, graphicMapping});
    })
    .scan((state: GameState, [ticker, midiNotes, graphicMapping]) =>
            mutateGameState(state, midiNotes, ticker, graphicMapping)
        , defaultGameState);

// PixiApp
pixiApp.init(document.querySelector('.fireplace'), defaultGameState);

// Gameloop
gameLoop$
    .subscribe((gameState: GameState) => {
        pixiApp.render(gameState);
    });

// DMX Lights
let time = 0;
const MIDI_OUT_DEVICE = 'IAC Driver IAC Bus 4';
midiOutSubject$
    .withLatestFrom(midiOutput$)
    .throttleTime(50)
    .subscribe(([notesMapping, midiOutputs]) => {
        // when midi notes id match mapping with a redirect
        // send these to a hardcoded midi output
        const notesToSend = notesMapping.midiNotes
            .filter(n => notesMapping.graphicMapping
                .find(m => m.inputId === n.inputId && m.redirectOutput)
            );

        const output = midiOutputs.find(o => o.name === MIDI_OUT_DEVICE);
        if (!output) {
            return;
        }

        if (notesToSend.length) {
            time += 1;
            console.log(time, notesToSend);

            if (time % 2 === 0 ) {
                output.send(DMX_CONSTANTS.BLINDER_LEFT_ON);
            } else {
                output.send(DMX_CONSTANTS.BLINDER_RIGHT_ON);
            }
            output.send(DMX_CONSTANTS.BLACKOUT_OFF);
        } else {
            output.send(DMX_CONSTANTS.BLINDER_LEFT_OFF);
            output.send(DMX_CONSTANTS.BLINDER_RIGHT_OFF);
            output.send(DMX_CONSTANTS.BLACKOUT_ON);
        }

    });
