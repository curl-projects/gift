import { Tldraw } from "tldraw";

export default function WorldCanvas() {

    const shapeUtils = []
    const tools = []
    const bindingUtils = []
    const components = {
        // Toolbar: null,
        // MainMenu: null,
        // DebugMenu: null,
        // DebugPanel: null,
        // Minimap: null,
        // PageMenu: null,
        // ActionsMenu: null,
        // ZoomMenu: null,
        // QuickActions: null,
        // NavigationPanel: null,
        // HelpMenu: null,
        // ContextMenu: null,
        // StylePanel: null,
        // SharePanel: null,
    }

    return (
    //     <div className='finnDiv'>
    //         <h1>Hi!</h1>
    //     </div>
    // )
      <Tldraw 
                // shapeUtils={shapeUtils}
                // bindingUtils={bindingUtils}
                // tools={tools}
                // // components={components}
                // onMount={(editor) => {

                // }}
      />
    )
}