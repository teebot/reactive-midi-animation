export type MIDINote = {
    onOff: string;
    inputId: string;
    note: { key: string, octave: number };
    velocity: number;
}