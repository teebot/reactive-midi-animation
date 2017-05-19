import {Observable} from 'rxjs';
import MIDIInput = WebMidi.MIDIInput;
import MIDIMessageEvent = WebMidi.MIDIMessageEvent;
import {MIDINote} from '../types/midiNote';
import {areNotesEqual, midiMessageMapper} from '../utils/midiMapper';
import MIDIAccess = WebMidi.MIDIAccess;
import {Subject} from 'rxjs/Subject';
import MIDIOutput = WebMidi.MIDIOutput;
import {GraphicInputMapping} from '../types/graphicInputMapping';

const fakeKeyboardMIDIInput = {
    name: 'keyboard',
    id: '0',
    onmidimessage: null
};

const midiAccess$ = Observable.fromPromise(navigator.requestMIDIAccess());

/**
 * Emits all midi inputs available
 * @type Observable<Array<MIDIInput>>
 */
export const midiInputs$ = midiAccess$.map((midi: MIDIAccess) => {
    const midiInputs = Array.from(midi.inputs).map(([id, input]) => input);
    return [<MIDIInput>fakeKeyboardMIDIInput, ...midiInputs];
});

/**
 * Emits all midi outputs available
 * @type Observable<Array<MIDIOutput>>
 */
export const midiOutput$ = midiAccess$.map((midi: MIDIAccess) => {
    return Array.from(midi.outputs).map(([id, output]) => output);
});

/**
 * Emits whenever one of the MIDI instruments plays a note
 * Only pushed notes are emitted
 * @type Observable<Array<MIDINote>>
 */
let pushedNotes: Array<MIDINote> = [];
export const midiInputTriggers$ = midiInputs$
    .flatMap(inputs =>
        Observable.create((observer) =>
            inputs.forEach(i =>
                i.onmidimessage = (event) => observer.next(event)
            )
        )
    )
    .filter((midiMessage: MIDIMessageEvent) =>
        midiMessage.data[0] >= 128 && midiMessage.data[0] <= 159
    )
    .map((midiMessage: MIDIMessageEvent) => {
        const midiNote = midiMessageMapper(midiMessage);
        if (midiNote.onOff === 'on' && pushedNotes.indexOf(midiNote) === -1) {
            pushedNotes = [midiNote, ...pushedNotes];
        } else if (midiNote.onOff === 'off') {
            pushedNotes = pushedNotes.filter(n => !areNotesEqual(n, midiNote));
        }
        return pushedNotes;
    })
    .distinctUntilChanged()
    .startWith([]);


export const midiOutSubject$ = new Subject<{midiNotes: Array<MIDINote>, graphicMapping: Array<GraphicInputMapping>}>();