import {Observable, Scheduler} from 'rxjs';
import {defaultGameState, GameState} from './types/gameState';
import {render} from './renderer';
import {keyboard$} from './observables/keyboard';
import {midiInputs$, midiInputTriggers$} from './observables/midi';
import {MIDINote} from './types/midiNote';
import MIDIInput = WebMidi.MIDIInput;
import './styles/index.css';

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

// Gameloop
gameLoop$.subscribe((gameState: GameState) => {
    render(gameState);
});

// Add fullscreen support
function fullscreen(){
    let el = document.querySelector('canvas');

    if(el.webkitRequestFullScreen) {
        el.webkitRequestFullScreen();
    } else {
        console.log('Full screen not supported')
    }
}

// Add fullscreen button
const fullScreenButton = document.createElement('button');
fullScreenButton.innerHTML = "Full Screen";
fullScreenButton.className = "button-primary";
fullScreenButton.addEventListener("click", fullscreen);
const sidebar = document.querySelector('.sidebar');
sidebar.appendChild(fullScreenButton);

// Print midi inputs
midiInputs$.subscribe((inputs: Array<MIDIInput>) => {
    inputs.forEach(item => {
        let inputDiv = document.createElement('div');
        inputDiv.className = 'input';
        let inputTitle = document.createElement('div');
        inputTitle.className = 'title';
        inputTitle.textContent = item.name;
        let inputSelector = document.createElement('div');
        inputSelector.className = 'selector';
        let selectContainer = document.createDocumentFragment(),
            select = document.createElement("select");
        //select.options.add( new Option("Graphic Type 1", "GFX1", true, true) );
        selectContainer.appendChild(select);
        inputSelector.appendChild(selectContainer);
        inputDiv.appendChild(inputTitle);
        inputDiv.appendChild(inputSelector);
        sidebar.appendChild(inputDiv);

        // TODO: Check it doesn't already exist
    });
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
        state.color = keyColors[midiNotes[0].note.key] || 0x9966FF
    } else {
        state.circleX = 64;
        state.color = 0x9966FF;
    }
    return state;
}
