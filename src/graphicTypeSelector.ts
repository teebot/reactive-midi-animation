import MIDIInput = WebMidi.MIDIInput;
import {Observable} from "rxjs/Observable";

/**
 * Adds input items to a sidebar to allow users to select types of graphics to use per input
 * For example: MIDI Input 1 = Triangles
 */
export class GraphicTypeSelector {
    sidebar: Element;
    graphicTypes: Array<string>;
    graphicsMidiInputMap: any; // Object containing map of type to input (e.g. boringBoxes: "123123")
    unassignedGraphics: Array<string>;

    constructor(
        midiInputs$: Observable<Array<MIDIInput>>,
        sidebar: Element,
        graphicTypes: Array<string>
    ) {
        this.sidebar = sidebar;
        this.graphicTypes = graphicTypes;
        this.unassignedGraphics = [...graphicTypes]; // Copy
        this.graphicsMidiInputMap = {};
        midiInputs$.subscribe((inputs: Array<MIDIInput>) => {
            this.clearSidebar();
            this.renderInputItems(inputs);
        });
    }

    clearSidebar(): void {
        // Remove any existing input items from the sidebar
        Array.prototype.forEach.call(this.sidebar.querySelectorAll('.input'), function( node ) {
            node.parentNode.removeChild(node);
        });
    }

    // Handle dropdown changes (when an input has changed its graphics type)
    handleGraphicsChange(event) {
        // TODO: There is a bug here regarding the previously selected value... you can fix it by getting all current
        // values, then comparing with the one that changed or something, and removing those that are unassigned!
        //let x = Object.values(graphicsMidiInputMap);
        console.log('keys', Object.keys(this.graphicsMidiInputMap));
        console.log('currval', event.srcElement.value);
        if (event.srcElement.value in Object.keys(this.graphicsMidiInputMap)) {
            delete this.graphicsMidiInputMap[event.srcElement.value];
        }

        this.graphicsMidiInputMap[event.srcElement.value] = event.srcElement.id.substring(6);
        console.log(this.graphicsMidiInputMap);
    }

    renderInputItems(inputs : Array<MIDIInput>) {
        // Display MIDI inputs and assign + map them to types of graphics
        inputs.forEach(input => {
            let graphicToAssign;
            if (this.unassignedGraphics.length) {
                graphicToAssign = this.unassignedGraphics.pop();
                this.graphicsMidiInputMap[graphicToAssign] = input.id; // e.g. lasers: 123901
            }
            let inputDiv = document.createElement('div');
            inputDiv.className = 'input';
            let inputTitle = document.createElement('div');
            inputTitle.className = 'title';
            inputTitle.textContent = input.name;
            let inputSelector = document.createElement('div');
            inputSelector.className = 'selector';
            let selectContainer = document.createDocumentFragment(),
                select = document.createElement("select");
            select.id = 'input-' + input.id;
            let fullListOfGraphics = Object.keys(this.graphicsMidiInputMap).concat(this.unassignedGraphics);
            fullListOfGraphics.sort().forEach(item => {
                select.options.add(new Option(item, item, true, item === graphicToAssign));
            });
            select.addEventListener('change', this.handleGraphicsChange, false);
            selectContainer.appendChild(select);
            inputSelector.appendChild(selectContainer);
            inputDiv.appendChild(inputTitle);
            inputDiv.appendChild(inputSelector);
            this.sidebar.appendChild(inputDiv);
        });
    }
}
