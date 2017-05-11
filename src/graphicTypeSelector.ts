import MIDIInput = WebMidi.MIDIInput;
import {Observable} from 'rxjs/Observable';
import * as h from 'hyperscript';
import {GraphicInputMapping} from './types/graphicInputMapping';

/**
 * Adds input items to a sidebar to allow users to select types of graphics to use per input
 * For example: MIDI Input 1 = Triangles
 */
export function getGraphicTypeSelection(midiInputs: Array<MIDIInput>,
                                        graphicTypes: Array<string>,
                                        sideBarElement: Element): Observable<Array<GraphicInputMapping>> {

    const initialMapping: Array<GraphicInputMapping> = [];

    const selectBoxes = midiInputs.map((midiInput, index) => {
        const initialGraphicType = graphicTypes[index];
        initialMapping.push({inputId: midiInput.id, graphicType: initialGraphicType});

        const selectBox = renderSelectBox(midiInput, graphicTypes, initialGraphicType);
        sideBarElement.appendChild(h('div.input', [h('div.title', midiInput.name), h('div.selector', selectBox)]));
        return selectBox;
    });

    // return all select values if one of them changes
    return Observable.merge(...selectBoxes.map(s =>
        Observable.fromEvent(s, 'change')
            .map((event) =>{
                console.log((<any>event).target.value);
                return selectBoxes.map(s => ({inputId: s.name, graphicType: s.value}))}
            )))
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