import { useState, useLayoutEffect, useEffect } from 'react';
import _ from 'lodash'
import { Tldraw, createTLStore, defaultShapeUtils, defaultBindingUtils, DefaultSpinner, getSnapshot, loadSnapshot, useEditor } from 'tldraw';
import { ClientOnly } from 'remix-utils/client-only';

// CUSTOM UI
import CustomToolbar from "~/components/canvas/custom-ui/custom-toolbar/CustomToolbar"
import { CollectionProvider } from "~/components/canvas/custom-ui/collections";
import { GraphLayoutCollection } from "~/components/canvas/custom-ui/graph/GraphLayoutCollection";
import { GraphUi } from "~/components/canvas/custom-ui/graph/GraphUi";

// CUSTOM SHAPES
import { ConceptShapeUtil } from "~/components/canvas/shapes/concept-shape/ConceptShapeUtil"
import { ConceptShapeTool } from "~/components/canvas/shapes/concept-shape/ConceptShapeTool"

export default function WorldCanvas() {
    const [editor, setEditor] = useState(null)

    useEffect(() => {
        console.log("EDITOR:", editor)
    }, [editor])

    const shapeUtils = [ConceptShapeUtil]
    const tools = [ConceptShapeTool]
    const bindingUtils = []
    const collections = [GraphLayoutCollection]
    const components = {}
    // const components = {
    //     Toolbar: null,
    //     MainMenu: null,
    //     DebugMenu: null,
    //     DebugPanel: null,
    //     Minimap: null,
    //     PageMenu: null,
    //     ActionsMenu: null,
    //     ZoomMenu: null,
    //     QuickActions: null,
    //     NavigationPanel: null,
    //     HelpMenu: null,
    //     ContextMenu: null,
    //     StylePanel: null,
    //     SharePanel: null,
    // }

    const PERSISTENCE_KEY = 'canvas-persistence'
    const [store, setStore] = useState(() => createTLStore({ shapeUtils: [...defaultShapeUtils, ...shapeUtils], bindingUtils: [...defaultBindingUtils, ...bindingUtils] }))
    const [loadingState, setLoadingState] = useState({ status: 'loading' })

    useLayoutEffect(() => {
        async function loadData() {
            setLoadingState({ status: 'loading' })
            const persistedSnapshot = localStorage.getItem(PERSISTENCE_KEY)

            // Get persisted data from local storag
            if (persistedSnapshot) {
                try {
                    const snapshot = JSON.parse(persistedSnapshot)
                    loadSnapshot(store, snapshot)
                    setLoadingState({ status: 'ready' })
                } catch (error) {
                    console.error("Store Error")
                    setLoadingState({ status: 'error', error: error.message })
                }
            } else {
                setLoadingState({ status: 'ready' })
            }
        }

        loadData()

        // Each time the store changes, run the (debounced) persist function
        const cleanupFn = store.listen(
            _.throttle(() => {
                const snapshot = getSnapshot(store)
                localStorage.setItem(PERSISTENCE_KEY, JSON.stringify(snapshot));
            }, 10)
        )

        return () => {
            cleanupFn();
        };
    }, [store]);

    if (loadingState.status === 'loading') {
        return (
            <div className="tldraw__editor">
                <h2>
                    <DefaultSpinner />
                </h2>
            </div>
        )
    }

    if (loadingState.status === 'error') {
        return (
            <div className="tldraw__editor">
                <h2>Error!</h2>
                <p>{loadingState.error}</p>
            </div>
        )
    }

    return (
        <Tldraw
            store={store}
            shapeUtils={shapeUtils}
            bindingUtils={bindingUtils}
            tools={tools}
            components={components}
            onMount={setEditor}
        >
            {editor && (
                <CollectionProvider editor={editor} collections={collections}>
                    <GraphUi />
                </CollectionProvider>
            )}
            {/* <CustomToolbar /> */}
        </Tldraw>
    )
}