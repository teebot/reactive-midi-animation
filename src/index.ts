import {Observable, Scheduler} from 'rxjs';
import {defaultGameState, GameState} from './types/gameState';
import {Renderer} from './renderer';
import {keyboard$} from './observables/keyboard';
import {midiInputs$, midiInputTriggers$} from './observables/midi';
import {MIDINote} from './types/midiNote';
import MIDIInput = WebMidi.MIDIInput;
import './styles/index.css';
import './styles/fire.css';
import {getGraphicTypeSelection} from './observables/graphicTypeSelector';
import {Base} from './graphics/base';
import {shuffle} from './utils/shuffle';
import {intersectionBy} from 'lodash';
import {GraphicInputMapping} from './types/graphicInputMapping';

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
    getGraphicTypeSelection(midiInputs, renderer.graphicTypes, document.querySelector('.sidebar'))
);

const midi$ = Observable.merge(keyboard$, midiInputTriggers$);

const gameLoop$ = ticker$.combineLatest(midi$, graphicMapping$)
    .scan((state: GameState, [ticker, midiNotes, graphicMapping]) =>
            mutateGameState(state, midiNotes, ticker, graphicMapping)
        , defaultGameState);

const renderer = new Renderer(
    defaultGameState,
    document.querySelector('.fireplace')
);

// Gameloop
gameLoop$.subscribe((gameState: GameState) => {
    renderer.render(gameState);
});

// Keep a map of object indexes which are currently visible per graphic type, e.g. {lasers: {'C#5':0, 'D5':1}, ...}
let activeObjectsPerGraphicType = renderer.graphicTypes.reduce(function (result, graphicType) {
    result[graphicType] = {};
    return result;
}, {});

function mutateGameState(state: GameState, midiNotes: Array<MIDINote>, ticker: any, graphicMapping: Array<GraphicInputMapping>): GameState {
    if (midiNotes.length === 0) {
        // Initiate stop animation for all visible objects
        renderer.graphicTypes.forEach(graphicType => {
            activeObjectsPerGraphicType[graphicType] = {};
            state[graphicType].filter(item => item.isVisible).forEach((item, index) => item.stop(index));
        });
        return state;
    }

    // Loop through each type of graphic (lasers, triangles, ...)
    renderer.graphicTypes.forEach(graphicType => {
        // Get the notes that are pressed for the input associated with this graphic (and a list of keys+octaves)
        const matchingInputs = graphicMapping.filter(g => g.graphicType === graphicType);
        const graphicNotes = intersectionBy(midiNotes, matchingInputs, 'inputId');
        const pressedNoteStrings = graphicNotes.map(midi => midi.note.key + midi.note.octave); // e.g. ['C#5', 'D#5']

        // Get the type of animation we are going to apply for this graphic (e.g. random, piano, stack)
        const animationType = state[graphicType][0].animationType || Base.ANIMATION_TYPE_RANDOM;

        // First update activeObjectsPerGraphicType (add new keys, remove unpressed ones)
        if (pressedNoteStrings.length > 0) {
            const previousActiveNoteStrings = Object.keys(activeObjectsPerGraphicType[graphicType]);

            // Add new pressed notes
            pressedNoteStrings.forEach(pressedNoteString => {
                if (previousActiveNoteStrings.indexOf(pressedNoteString) === -1) {
                    activeObjectsPerGraphicType[graphicType][pressedNoteString] = -1; // To be assigned below
                }
            });

            // Remove unpressed notes
            previousActiveNoteStrings.forEach(previousNoteString => {
                if (pressedNoteStrings.indexOf(previousNoteString) === -1) {
                    delete activeObjectsPerGraphicType[graphicType][previousNoteString];
                }
            });
        } else {
            // Reset active items for this graphic type
            activeObjectsPerGraphicType[graphicType] = {};
        }

        // Assign objects to new notes (depending on the type of animation)
        for (let noteString in activeObjectsPerGraphicType[graphicType]) {
            // If the new note has not been assigned to an object
            if (activeObjectsPerGraphicType[graphicType][noteString] === -1) {
                // Assign note to an available object (if we can find one)
                let availableObjectIndex = null;
                let availableItemIndexes = [];
                switch (animationType) {
                    case Base.ANIMATION_TYPE_SOLO:
                        // For "solo" animations we always use the first object
                        if (state[graphicType].length) {
                            availableObjectIndex = 0;
                        }
                        break;

                    case Base.ANIMATION_TYPE_STACK:
                        // For "amount" animations we just get the next one that is not visible
                        availableItemIndexes = state[graphicType]
                            .map((item, idx) => !item.isVisible ? idx : null)
                            .filter(a => a !== null);
                        availableObjectIndex = availableItemIndexes.length ? availableItemIndexes[0] : null;
                        break;

                    case Base.ANIMATION_TYPE_AMOUNT:
                        // For "stack" animations we get the next one that is not decaying AND not visible
                        availableItemIndexes = state[graphicType]
                            .map((item, idx) => (!item.isVisible || item.isDecaying) ? idx : null)
                            .filter(a => a !== null);
                        availableObjectIndex = availableItemIndexes.length ? availableItemIndexes[0] : null;
                        break;

                    case Base.ANIMATION_TYPE_RANDOM:
                        // For "random" animations we get a random non-visible (available) one
                        availableItemIndexes = state[graphicType]
                            .map((item, idx) => !item.isVisible ? idx : null)
                            .filter(a => a !== null);
                        availableObjectIndex = availableItemIndexes.length ? shuffle(availableItemIndexes)[0] : null;
                        break;
                }
                if (availableObjectIndex !== null) {
                    activeObjectsPerGraphicType[graphicType][noteString] = availableObjectIndex;
                } else {
                    // Remove from queue if we couldn't find anything for it (avoids bugs)
                    delete activeObjectsPerGraphicType[graphicType][noteString];
                }
            }
        }

        // Animate or die
        const animatedObjectIndexes = Object.keys(activeObjectsPerGraphicType[graphicType]).map(key => {
            return activeObjectsPerGraphicType[graphicType][key];
        });

        state[graphicType].forEach((item, graphicIndex) => {
            if (animatedObjectIndexes.indexOf(graphicIndex) !== -1) {
                item.animate(graphicIndex);
            } else if (item.isVisible) {
                item.stop(graphicIndex);
            }
        });
    });
    return state;
}

