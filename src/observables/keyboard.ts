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
    z: ['C', 0],
    x: ['C#', 1],
    c: ['D', 2],
    v: ['D#', 3],
    b: ['E', 4],
    n: ['F', 5],
    m: ['F#', 6],
    ",": ['G', 7],
    ".": ['G#', 8],
    "/": ['A', 9],
    "-": ['A#', 10],
    "=": ['B', 11],

    a: ['C', 12],
    s: ['C#', 13],
    d: ['D', 14],
    f: ['D#', 15],
    g: ['E', 16],
    h: ['F', 17],
    j: ['F#', 18],
    k: ['G', 19],
    l: ['G#', 20],
    ";": ['A', 21],
    "'": ['A#', 22],
    "\\": ['B', 23],

    q: ['C', 24],
    w: ['C#', 25],
    e: ['D', 26],
    r: ['D#', 27],
    t: ['E', 28],
    y: ['F', 29],
    u: ['F#', 30],
    i: ['G', 31],
    o: ['G#', 32],
    p: ['A', 33],
    "[": ['A#', 34],
    "]": ['B', 35]
};

const VALID_KEYBOARD_KEYS = Object.keys(KEYBOARD_MAPPING);

function pushedKeysToMIDINote(pushedKeys: Array<string>): Array<MIDINote> {
    return pushedKeys.filter(k => VALID_KEYBOARD_KEYS.indexOf(k) !== -1).map(k => {
        const mapped = KEYBOARD_MAPPING[k.toLowerCase()];
        if (mapped) {
            return {
                onOff: 'on',
                inputId: 'keyboard',
                note: {key: mapped[0], octave: 1, id: mapped[1]},
                velocity: 64,
            }
        }
    });
}
