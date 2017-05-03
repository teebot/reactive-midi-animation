import {range, flatMap} from 'lodash';
import {MIDINote} from '../types/midiNote';
import MIDIMessageEvent = WebMidi.MIDIMessageEvent;

const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const MIDI_IDS = 128;
const OCTAVES = 11;

// Generate a map of midi codes
// 0 = key: C, octave: 0
// 13 = key: C#, octave: 1
// ...
const possibleNotes = flatMap(range(0, OCTAVES), (octave) => KEYS.map(key => ({ octave, key })));
const midiNotes = range(0, MIDI_IDS).map(i => possibleNotes[i]);

// convert midi code to MIDINote
export function midiMessageMapper(midiMessage: MIDIMessageEvent): MIDINote {
    const [origin, key, velocity] = midiMessage.data;

    return {
        onOff: origin >= 144 && origin <= 159 ? 'on' : 'off',
        inputId: midiMessage.srcElement.id,
        note: {...midiNotes[key], id: key},
        velocity
    }
}

export function areNotesEqual(a: MIDINote, b: MIDINote): boolean {
    return a.inputId === b.inputId && a.note.key === b.note.key && a.note.octave === b.note.octave;
}
