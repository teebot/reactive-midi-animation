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
    currentInputs: Array<MIDIInput>;

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
            this.currentInputs = inputs;
            this.clearSidebar();
            this.autoAssignInputs();
            this.renderInputItems();
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

        //let x = Object.values(graphicsMidiInputMap);
        const newInputId = event.srcElement.id.substring(6);
        const newGraphicsType = event.srcElement.value;

        let foundConflictingValue = false;
        Object.keys(this.graphicsMidiInputMap).forEach(graphicsType => {
            let currentInputId = this.graphicsMidiInputMap[graphicsType];
            if (currentInputId === newInputId && graphicsType !== newGraphicsType) {
                // Are there any other graphics set to my input?
                foundConflictingValue = true;
                this.graphicsMidiInputMap[graphicsType] = null;
            }
        });

        this.graphicsMidiInputMap[newGraphicsType] = newInputId;

        if (foundConflictingValue) {
            // Update dropdowns to show real values
            this.clearSidebar();
            this.renderInputItems();
        }
    }

    autoAssignInputs() {
        // Display MIDI inputs and assign + map them to types of graphics
        this.currentInputs.forEach(input => {
            let graphicToAssign = null;
            if (this.unassignedGraphics.length) {
                graphicToAssign = this.unassignedGraphics.pop();
                this.graphicsMidiInputMap[graphicToAssign] = input.id; // e.g. lasers: 123901
            }
        });

        // If we still have unassigned graphics, set their inputs to null
        if (this.unassignedGraphics.length) {
            this.unassignedGraphics.forEach(graphicType => {
                this.graphicsMidiInputMap[graphicType] = null;
            });
        }
    }

    renderInputItems() {
        // Display MIDI inputs and assign + map them to types of graphics
        this.currentInputs.forEach(input => {
            let selectedGraphic = null;
            Object.keys(this.graphicsMidiInputMap).forEach(graphicType => {
                if (this.graphicsMidiInputMap[graphicType] === input.id) {
                    selectedGraphic = graphicType;
                }
            });

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
            Object.keys(this.graphicsMidiInputMap).sort().forEach(item => {
                select.options.add(new Option(item, item, true, item === selectedGraphic));
            });
            select.options.add(new Option('none', 'none', true, selectedGraphic === null));
            let that = this;
            select.addEventListener('change', function(event) { that.handleGraphicsChange(event); }, false);
            selectContainer.appendChild(select);
            inputSelector.appendChild(selectContainer);
            inputDiv.appendChild(inputTitle);
            inputDiv.appendChild(inputSelector);
            this.sidebar.appendChild(inputDiv);
        });
    }
}
