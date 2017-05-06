import {Observable, Scheduler} from 'rxjs';
import {defaultGameState, GameState} from './types/gameState';
import {render} from './renderer';
import {keyboard$} from './observables/keyboard';
import {midiInputs$, midiInputTriggers$} from './observables/midi';
import {MIDINote} from './types/midiNote';
import MIDIInput = WebMidi.MIDIInput;

// --------------------- MIDI FILE LOADING EXPERIMENT START ------------------

function handleFileSelect(event) {
    const files = input.files;

    // Allowed media types
    const accept = { binary : ["audio/midi"] };

    const fr = new FileReader();
    fr.onload = function(e) {
        if (window.hasOwnProperty('playMidi')) {
            window['midiFile'] = e.target['result'];
            window['loadMidi'].call();
        }
    };

    if (files.length) {
        // If MIDI file
        let file = files[0];
        if (file !== null) {
            if (accept.binary.indexOf(file.type) > -1) {
                fr.readAsDataURL(file);
            }
        }
    }
}

let input = document.createElement('input');
input.type = 'file';
input.name = 'file';
document.body.appendChild(input);
input.addEventListener('change', handleFileSelect, false);

let start = document.createElement('button');
input.innerHTML = 'start';
document.body.appendChild(start);
start.addEventListener('click', function() {
    console.log('start');
    if (window.hasOwnProperty('playMidi')) {
        window['playMidi'].call();
    }
}, false);

let stop = document.createElement('button');
input.innerHTML = 'stop';
document.body.appendChild(stop);
stop.addEventListener('click', function() {
    console.log('stop');
    if (window.hasOwnProperty('stopMidi')) {
        window['stopMidi'].call();
    }
}, false);

window.addEventListener("message", function(inputStr) {
    if (inputStr.data && typeof inputStr.data === 'string' && inputStr.data.indexOf('/') > -1) {
        let data = inputStr.data.split('/');
        const channel = data[0]; // channel note is playing on
        const message = data[1]; // 128 is noteOff, 144 is noteOn
        const note = data[2]; // the note (e.g. 67)
        const velocity = data[3]; // the velocity of the note
        console.log(channel, message, note);

        // TODO: Fire MIDIMessageEvent events ()
    }
}, false);


// --------------------- MIDI FILE LOADING EXPERIMENT END ------------------

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
        state.color = keyColors[midiNotes[0].note.key] || 0x9966FF
    } else {
        state.circleX = 64;
        state.color = 0x9966FF;
    }
    return state;
}
