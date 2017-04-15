import {Observable} from 'rxjs';
import {Application} from 'pixi.js';

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


const app = new Application(800, 600, {backgroundColor : 0x000000});
document.body.appendChild(app.view);
