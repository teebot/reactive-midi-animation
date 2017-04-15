import {Observable} from 'rxjs';

Observable.fromPromise(navigator.requestMIDIAccess())
    .map(midi => midi.inputs.values().next().value)
    .flatMap(input => {
        if (!input) {
            throw new Error('No MIDI input available');
        }
        return Observable.create(observer => {
            input.onmidimessage = (event) => {
                observer.next(event);
            }
        });
    })
    .subscribe(message => console.log(message));
