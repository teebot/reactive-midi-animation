import MIDIInput = WebMidi.MIDIInput;
import {Observable} from 'rxjs/Observable';
import * as h from 'hyperscript';
import {GraphicInputMapping} from '../types/graphicInputMapping';
import {defaultGameState} from '../types/gameState';
import MIDIOutput = WebMidi.MIDIOutput;

const GRAPHIC_TYPES = Object.keys(defaultGameState);

/**
 * Adds input items to a sidebar to allow users to select types of graphics to use per input
 * For example: MIDI Input 1 = Triangles
 * For example: MIDI Input 1 = Triangles
 */
export function getGraphicTypeSelection(midiInputs: Array<MIDIInput>, sideBarElement: Element): Observable<Array<GraphicInputMapping>> {

    const initialMapping: Array<GraphicInputMapping> = [];
    const selectBoxes: Array<HTMLSelectElement> = [];
    const checkBoxes: Array<HTMLInputElement> = [];

    midiInputs.forEach((midiInput, index) => {
        const initialGraphicType = GRAPHIC_TYPES[index];
        initialMapping.push({inputId: midiInput.id, graphicType: initialGraphicType});

        const checkBox = h('input', {type: 'checkbox', name: midiInput.id});
        const selectBox = renderSelectBox(midiInput, GRAPHIC_TYPES, initialGraphicType);
        sideBarElement.appendChild(h('div.input', [
            h('div.title', midiInput.name),
            h('div.selector', selectBox),
            h('div.sync', [
                h('label', 'lightsync'),
                checkBox])]
        ));

        selectBoxes.push(selectBox);
        checkBoxes.push(checkBox);
    });

    const getFormValues = (): Array<GraphicInputMapping> => {
        return midiInputs.map(input => {
            const graphicType = (<HTMLSelectElement>document.querySelector(`select[name="${input.id}"]`)).value;
            const redirectOutput = (<HTMLInputElement>document.querySelector(`input[type="checkbox"][name="${input.id}"]`)).checked;
            return {inputId: input.id, graphicType, redirectOutput}
        });
    };

    const checkBoxes$ = Observable.merge(...checkBoxes.map(c => Observable.fromEvent(c, 'change').map(_ => getFormValues())));
    const selectBoxes$ = Observable.merge(...selectBoxes.map(s => Observable.fromEvent(s, 'change').map(_ => getFormValues())));

    // return all select values if one of them changes
    return Observable.merge(checkBoxes$, selectBoxes$)
        .startWith(initialMapping);
}

function renderSelectBox(input: MIDIInput, graphicTypes: Array<string>, initialValue): HTMLSelectElement {
    return h('select', {name: input.id},
        [h('option', {selected: initialValue === undefined}, 'none'),
            ...graphicTypes.map(graphicType =>
                h('option', {selected: graphicType === initialValue}, graphicType)
            )]
    );
}