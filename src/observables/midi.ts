import {Observable} from "rxjs";
import MIDIInput = WebMidi.MIDIInput;
import MIDIMessageEvent = WebMidi.MIDIMessageEvent;
import {MIDINote} from "../types/midiNote";
import {areNotesEqual, midiMessageMapper} from "../utils/midiMapper";

export const midiInputs$ = Observable.fromPromise(navigator.requestMIDIAccess())
    .map(midi => midi.inputs.values().next().value)
    .filter(x => !!x);

let pushedNotes: Array<MIDINote> = [];
export const midiInputTriggers$: Observable<Array<MIDINote>> = midiInputs$
    .flatMap(i =>
        Observable.create((observer) => {
            i.onmidimessage = (event) => observer.next(event);
        })
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
