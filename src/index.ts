import {Observable, Scheduler} from "rxjs";
import {defaultGameState, GameState} from "./types/gameState";
import {Renderer} from "./renderer";
import {keyboard$} from "./observables/keyboard";
import {midiInputs$, midiInputTriggers$} from "./observables/midi";
import {MIDINote} from "./types/midiNote";

const TICKER_INTERVAL = 17;
const ticker$ = Observable
    .interval(TICKER_INTERVAL, Scheduler.animationFrame)
    .map(() => ({
        time: Date.now(),
        deltaTime: null
    }))
    .scan(
        (previous, current) => ({
            time: current.time,
            deltaTime: (current.time - previous.time) / 1000
        })
    );

midiInputs$.subscribe(i => console.log(i.name));
const midi$ = Observable.merge(keyboard$, midiInputTriggers$);

const gameLoop$ = ticker$.combineLatest(midi$)
    .scan((state: GameState, [ticker, midiNotes]) =>
            mutateGameState(midiNotes, state, ticker)
        , defaultGameState);

Renderer.Instance.init();

gameLoop$.subscribe((gameState: GameState) => {
    Renderer.Instance.render(gameState);
});

function mutateGameState(midiNotes: Array<MIDINote>, state: GameState, ticker: any) {
    if (midiNotes.length) {
        state.circleX += ticker.deltaTime * 100;
    } else {
        state.circleX = 64;
    }
    return state;
}
