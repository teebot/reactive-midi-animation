import {Observable, Scheduler} from 'rxjs';
import {defaultGameState, GameState} from './types/gameState';
import {Renderer} from './renderer';
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

const renderer = new Renderer(defaultGameState, document.querySelector('.graphics'));

// Gameloop
gameLoop$.subscribe((gameState: GameState) => {
    renderer.render(gameState);
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

// Map graphics to MIDI inputs (e.g. lasers or boxes)
const graphicsMidiInputMap = {};
const unassignedGraphics = ['lasers', 'triangles', 'boringBoxes'];

// Print midi inputs and assign to map
midiInputs$.subscribe((inputs: Array<MIDIInput>) => {
    // TODO: Check items aren't already in sidebar (or clear whole div on init)

    inputs.forEach(input => {
        let graphicToAssign;
        if (unassignedGraphics.length) {
            graphicToAssign = unassignedGraphics.pop();
            graphicsMidiInputMap[graphicToAssign] = input.id; // e.g. lasers: 123901
            // TODO: Use the one we just popped below as well (to pre-select the inputs in the dropdowns)
        }
        let inputDiv = document.createElement('div');
        inputDiv.className = 'input';
        let inputTitle = document.createElement('div');
        inputTitle.className = 'title';
        inputTitle.textContent = input.name;
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

