import {defaultGameState, GameState} from '../types/gameState';
import {MIDINote} from '../types/midiNote';
import {GraphicInputMapping} from '../types/graphicInputMapping';
import {intersectionBy} from 'lodash';
import {shuffle} from '../utils/shuffle';
import {Base} from '../graphics/base';
import {GraphicsNotes} from '../types/graphicsNotes';

const GRAPHIC_TYPES = Object.keys(defaultGameState);

// Keep a map of object indexes which are currently visible per graphic type, e.g. {lasers: {'C#5':0, 'D5':1}, ...}
let graphicsNotesState: GraphicsNotes = GRAPHIC_TYPES.reduce(function (result, graphicType) {
    result[graphicType] = {};
    return result;
}, {});

function updateWithPressedKeys(graphicsNotes: GraphicsNotes, pressedNoteStrings: any, graphicType): GraphicsNotes {
// First update activeObjectsPerGraphicType (add new keys, remove unpressed ones)
    if (pressedNoteStrings.length > 0) {
        const previousActiveNoteStrings = Object.keys(graphicsNotes[graphicType]);

        // Add new pressed notes
        pressedNoteStrings.forEach(pressedNoteString => {
            if (previousActiveNoteStrings.indexOf(pressedNoteString) === -1) {
                graphicsNotes[graphicType][pressedNoteString] = -1; // To be assigned below
            }
        });

        // Remove unpressed notes
        previousActiveNoteStrings.forEach(previousNoteString => {
            if (pressedNoteStrings.indexOf(previousNoteString) === -1) {
                delete graphicsNotes[graphicType][previousNoteString];
            }
        });
    } else {
        // Reset active items for this graphic type
        graphicsNotes[graphicType] = {};
    }
    return graphicsNotes;
}

export function mutateGameState(state: GameState, midiNotes: Array<MIDINote>, ticker: any, graphicMapping: Array<GraphicInputMapping>): GameState {
    if (midiNotes.length === 0) {
        // Initiate stop animation for all visible objects
        GRAPHIC_TYPES.forEach(graphicType => {
            graphicsNotesState[graphicType] = {};
            state[graphicType].filter(item => item.isVisible).forEach((item, index) => item.stop(index));
        });
        return state;
    }

    // Loop through each type of graphic (lasers, triangles, ...)
    GRAPHIC_TYPES.forEach(graphicType => {
        // Get the notes that are pressed for the input associated with this graphic (and a list of keys+octaves)
        const matchingInputs = graphicMapping.filter(g => g.graphicType === graphicType);

        // TODO: Simplify the following with something like this... (it currently has a bug as it returns only 1 item)
        // const graphicNotes = intersectionBy(midiNotes, matchingInputs, 'inputId');
        let graphicNotes = [];
        midiNotes.forEach(note => {
            matchingInputs.forEach(input => {
                if (note.inputId === input.inputId) {
                    graphicNotes.push(note);
                }
            });
        });

        const pressedNoteStrings = graphicNotes.map(midi => midi.note.key + midi.note.octave); // e.g. ['C#5', 'D#5']

        // Get the type of animation we are going to apply for this graphic (e.g. random, piano, stack)
        const animationType = state[graphicType][0].animationType || Base.ANIMATION_TYPE_RANDOM;

        updateWithPressedKeys(graphicsNotesState, pressedNoteStrings, graphicType);

        // Assign objects to new notes (depending on the type of animation)
        for (let noteString in graphicsNotesState[graphicType]) {
            // If the new note has not been assigned to an object
            if (graphicsNotesState[graphicType][noteString] === -1) {
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
                    graphicsNotesState[graphicType][noteString] = availableObjectIndex;
                } else {
                    // Remove from queue if we couldn't find anything for it (avoids bugs)
                    delete graphicsNotesState[graphicType][noteString];
                }
            }
        }

        // Animate or die
        const animatedObjectIndexes = Object.keys(graphicsNotesState[graphicType]).map(key => {
            return graphicsNotesState[graphicType][key];
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

