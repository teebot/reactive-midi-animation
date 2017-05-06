import {Observable} from 'rxjs';
import {MIDINote} from '../types/midiNote';

/**
 * Simulates a MIDI instrument by emitting MIDINotes
 * mapped to keyboard keys
 * @type Observable<Array<MIDINote>>
 */
let pushedKeys: string[] = [];
export const keyboard$ = Observable
    .merge(
        Observable.fromEvent(document, 'keydown'),
        Observable.fromEvent(document, 'keyup')
    )
    .filter((event: KeyboardEvent) => event && event.key !== 'Meta')
    .map((event: KeyboardEvent) => {
        if (event.type === 'keydown' && pushedKeys.indexOf(event.key) === -1) {
            pushedKeys = [event.key, ...pushedKeys];
        }
        else if (event.type === 'keyup') {
            pushedKeys = pushedKeys.filter(k => k !== event.key);
        }
        return pushedKeys;
    })
    .map((pushedKeys) => pushedKeysToMIDINote(pushedKeys))
    .distinctUntilChanged()
    .startWith([]);


const KEYBOARD_MAPPING = {
    a: 'C',
    w: 'C#',
    s: 'D',
    e: 'D#',
    d: 'E',
    f: 'F',
    t: 'F#',
    g: 'G',
    y: 'G#',
    h: 'A',
    u: 'A#',
    j: 'B',
    k: 'C',
    o: 'C#',
    l: 'D',
    p: 'D#',
    m: 'E'
};
const VALID_KEYBOARD_KEYS = Object.keys(KEYBOARD_MAPPING);

function pushedKeysToMIDINote(pushedKeys: Array<string>): Array<MIDINote> {
    return pushedKeys.filter(k => VALID_KEYBOARD_KEYS.indexOf(k) !== -1).map(k => {
        const mapped = KEYBOARD_MAPPING[k.toLowerCase()];
        if (mapped) {
            return {
                onOff: 'on',
                inputId: '0',
                note: {key: mapped, octave: 1},
                velocity: 64,
            }
        }
    });
}
