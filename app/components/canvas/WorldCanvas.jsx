import { Tldraw } from "tldraw";

// CUSTOM UI
import CustomToolbar from "~/components/canvas/custom-ui/CustomToolbar"

// CUSTOM SHAPES
import { ConceptShapeUtil } from "~/components/canvas/shapes/concept-shape/ConceptShapeUtil"
import { ConceptShapeTool } from "~/components/canvas/shapes/concept-shape/ConceptShapeTool"

export default function WorldCanvas() {

    const shapeUtils = [ConceptShapeUtil]
    const tools = [ConceptShapeTool]
    const bindingUtils = []
    const components = {
        Toolbar: null,
        MainMenu: null,
        DebugMenu: null,
        DebugPanel: null,
        Minimap: null,
        PageMenu: null,
        ActionsMenu: null,
        ZoomMenu: null,
        QuickActions: null,
        NavigationPanel: null,
        HelpMenu: null,
        ContextMenu: null,
        StylePanel: null,
        SharePanel: null,
    }

    return (
    //     <div className='finnDiv'>
    //         <h1>Hi!</h1>
    //     </div>
    // )
      <Tldraw 
                shapeUtils={shapeUtils}
                bindingUtils={bindingUtils}
                tools={tools}
                components={components}
                // onMount={(editor) => {

                // }}
      >
        <CustomToolbar />
      </Tldraw>
    )
}