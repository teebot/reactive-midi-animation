import {Observable} from 'rxjs';
import {Application, Container, Graphics} from 'pixi.js';
import {MAP_KEY_TO_NOTE} from './constants';
import {Subject} from "rxjs/Subject";
import {ReplaySubject} from "rxjs/ReplaySubject";

// State
let inputsList = [];

// Inputs stream (fires when a device is connected)
let inputs$ = new ReplaySubject<any>();

// Listen to new devices that have been connected
inputs$.subscribe(deviceName => {
    // TODO: We might want to display the devices somewhere on the screen
    console.log(deviceName + " connected");
});

// Raw MIDI keyboard input
Observable.fromPromise(navigator.requestMIDIAccess())
    .map(midi => midi.inputs.values().next().value)
    .flatMap(input => {
        let keysPressed = {};
        if (!input) {
            // Avoid throwing errors as we might be only using a keyboard
            console.log('No MIDI input available');
            return;
        } else {
            // Add new device to list of inputs (and fire an event)
            const inputName = input.name.toLowerCase() || Math.random().toString();
            if (inputsList.indexOf(inputName) === -1) {
                inputsList.push(inputName);
                inputs$.next(inputName);
            }
        }
        return Observable.create(observer => {
            input.onmidimessage = (event) => {
                // On drumpads you get a continuous stream (firing multiple times for the same note) as you can vary the
                // velocity while the key is down... to avoid this we store which key is down (per input). Additionally,
                // sometimes it contains only 2 elements (when the velocity is the same), so we always check for 3
                if (event.data && Object.keys(event.data).length > 2 && event.srcElement) {
                    // Skip if [176, 1, 43], seems to fire this once on initialisation sometimes
                    if (event.data[0] === 176 && event.data[1] === 1) {
                        return;
                    }
                    // Gather data
                    const inputSource = event.srcElement.id;
                    const inputNote = event.data[1].toString();
                    const keyIsDown = event.data[0] === 144;
                    const keyIsUp = event.data[0] === 128;
                    // Only fire event on key down and key up (per note)
                    // TODO: There might be a race condition here... sometimes the keys stay 'locked' due to "off"
                    // being emitted before "on" (albeit with the correct timestamps), we can check event.timeStamp
                    // can't always reproduce so we should look into it
                    if (keyIsDown) {
                        if (!keysPressed[inputSource + inputNote]) {
                            keysPressed[inputSource + inputNote] = true;
                            observer.next(event);
                        }
                    } else if (keyIsUp) {
                        delete keysPressed[inputSource + inputNote];
                        observer.next(event);
                    }
                }
            }
        });
    })
    .subscribe(message => {
        const inputSource = message["srcElement"].name;
        const inputNote = message["data"][1];
        const inputVelocity = message["data"][2];
        const keyIsDown = message["data"][0] === 144;
        notes$.next({note: inputNote, input: inputSource.toLowerCase(), pressed: keyIsDown, velocity: inputVelocity});
    });

// Raw PC keyboard input
let keyDowns$ = Observable.fromEvent(document, 'keydown');
let keyUps$ = Observable.fromEvent(document, 'keyup');
Observable
    .merge(keyDowns$, keyUps$)
    .filter((function() {
        let keysPressed = {};
        return function(e) {
            const k = e.key || e.which;
            if (e.type == 'keyup') {
                delete keysPressed[k];
                return true;
            } else if (e.type == 'keydown') {
                if (keysPressed[k]) {
                    return false;
                } else {
                    keysPressed[k] = true;
                    return true;
                }
            }
        };
    })())
    .subscribe(function(e) {
        if (MAP_KEY_TO_NOTE[e.key]) {
            // Emit to notes stream with max velocity
            const note = MAP_KEY_TO_NOTE[e.key];
            notes$.next({note: note, input: "keyboard", pressed: (e.type === "keydown"), velocity: 128});
        }
    });
inputsList.push("keyboard");
inputs$.next("keyboard");

// Notes stream (listens to notes pressed on the keyboard and on MIDI devices)
// Sample object: {note:147, input:"akai", velocity:100, pressed:true}
let notes$ = new Subject<any>();

// TODO: Remove, just for debugging purposes
notes$.subscribe(a => {
    console.log(a);

    // TODO: Fix everything below, every time a note is fired we should animate
    let stage = new Container();
    stage.height = 400;
    stage.width = 400;

    let rectangle = new Graphics();
    rectangle.lineStyle(4, 0xFF3300, 1);
    rectangle.beginFill(0xFFFFFF);
    rectangle.drawRect(0, 0, 64, 64);
    rectangle.endFill();
    rectangle.x = 170;
    rectangle.y = 170;
    stage.addChild(rectangle);
    app.renderer.render(stage);
});

// Game engine
// TODO: fix
const app = new Application(800, 600, {backgroundColor : 0x000000});
document.body.appendChild(app.view);
app.renderer.backgroundColor = 0x333333;


