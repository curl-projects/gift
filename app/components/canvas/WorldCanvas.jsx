import { useState, useLayoutEffect, useEffect } from 'react';
import { useNavigation, useLoaderData, useRouteError } from '@remix-run/react';

import _ from 'lodash'
import { Tldraw, createTLStore, defaultShapeUtils, defaultBindingUtils, DefaultSpinner, getSnapshot, loadSnapshot, useEditor, createShapeId } from 'tldraw';
import { ClientOnly } from 'remix-utils/client-only';

// CUSTOM UI
import CustomToolbar from "~/components/canvas/custom-ui/custom-toolbar/CustomToolbar"
import { CollectionProvider } from "~/components/canvas/custom-ui/collections";
import { GraphLayoutCollection } from "~/components/canvas/custom-ui/graph/GraphLayoutCollection";
import { GraphUi } from "~/components/canvas/custom-ui/graph/GraphUi";
import { GraphTrigger } from "~/components/canvas/custom-ui/graph/GraphTrigger";
// CUSTOM SHAPES
import { ConceptShapeUtil } from "~/components/canvas/shapes/concept-shape/ConceptShapeUtil"
import { ConceptShapeTool } from "~/components/canvas/shapes/concept-shape/ConceptShapeTool"

import { ExcerptShapeUtil } from "~/components/canvas/shapes/excerpt-shape/ExcerptShapeUtil"
import { ExcerptShapeTool } from "~/components/canvas/shapes/excerpt-shape/ExcerptShapeTool"

import { ThreadShapeUtil } from "~/components/canvas/shapes/thread-shape/ThreadShapeUtil"
import { ThreadShapeTool } from "~/components/canvas/shapes/thread-shape/ThreadShapeTool"
import { ThreadBindingUtil} from "~/components/canvas/bindings/thread-binding/ThreadBindingUtil"

// HELPERS
import { createBoundArrow } from './helpers/arrow-funcs';

export default function WorldCanvas() {
    const [editor, setEditor] = useState(null)
    const data = useLoaderData();
    const navigation = useNavigation();
    const error = useRouteError();

    useEffect(() => {
        console.log("EDITOR:", editor)
    }, [editor])

    const shapeUtils = [ConceptShapeUtil, ExcerptShapeUtil, ThreadShapeUtil]
    const tools = [ConceptShapeTool, ExcerptShapeTool, ThreadShapeTool]
    const bindingUtils = [ThreadBindingUtil]
    const collections = [GraphLayoutCollection]
    const components = {
        Toolbar: null,
        // MainMenu: null,
        DebugMenu: null,
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

    const PERSISTENCE_KEY = 'canvas-persistence'
    const [store, setStore] = useState(() => createTLStore({ shapeUtils: [...defaultShapeUtils, ...shapeUtils], bindingUtils: [...defaultBindingUtils, ...bindingUtils] }))
    // const [loadingState, setLoadingState] = useState({ status: 'loading' })

    // useLayoutEffect(() => {
    //     async function loadData() {
    //         setLoadingState({ status: 'loading' })
    //         const persistedSnapshot = localStorage.getItem(PERSISTENCE_KEY)

    //         // Get persisted data from local storag
    //         if (persistedSnapshot) {
    //             try {
    //                 const snapshot = JSON.parse(persistedSnapshot)
    //                 loadSnapshot(store, snapshot)
    //                 setLoadingState({ status: 'ready' })
    //             } catch (error) {
    //                 console.error("Store Error")
    //                 setLoadingState({ status: 'error', error: error.message })
    //             }
    //         } else {
    //             setLoadingState({ status: 'ready' })
    //         }
    //     }

    //     loadData()

    //     // Each time the store changes, run the (debounced) persist function
    //     const cleanupFn = store.listen(
    //         _.throttle(() => {
    //             const snapshot = getSnapshot(store)
    //             localStorage.setItem(PERSISTENCE_KEY, JSON.stringify(snapshot));
    //         }, 10)
    //     )

    //     return () => {
    //         cleanupFn();
    //     };
    // }, [store]);

    if (navigation.state === 'loading') {
        return (
            <div className="tldraw__editor">
                <h2>
                    <DefaultSpinner />
                </h2>
            </div>
        )
    }

    if (error) {
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
            onMount={(editor) => {
                setEditor(editor)

                // load data
                const user = data.user

                console.log("USER DATA:", user)

                // create concepts
                for(let concept of user.concepts){
                    editor.createShape({
                        id: createShapeId(concept.id),
                        type: 'concept',
                        props: {
                            databaseId: concept.id,
                            text: concept.title,
                            plainText: concept.title
                        }
                    })
                }

                // create central data object
                const centralShapeId = createShapeId('name');

                const centralShape = editor.getShape(centralShapeId)
                if (!centralShape) {
                    console.log("CENTRAL SHAPE ID:", centralShapeId)
                    editor.createShape({
                        id: centralShapeId,
                        type: 'geo',
                        x: -100, // Half the width to center it
                        y: -50,  // Half the height to center it
                        props: {
                            w: 200,
                            h: 100,
                            geo: 'rectangle',
                            color: "blue",
                            text: user.name
                        },
                    });
                }

                console.log("SHAPE POSITION", editor.getShapePageBounds(editor.getShape(centralShapeId)).center)



                // create arrows
                const conceptShapes = editor.getCurrentPageShapes().filter(shape => shape.type === 'concept')

                for(let conceptShape of conceptShapes){
                    createBoundArrow(editor, centralShapeId, conceptShape.id)
                }
                // create an arrow linking concept one and two if they exist
                if (conceptShapes.length > 1) {
                    createBoundArrow(editor, conceptShapes[0].id, conceptShapes[1].id)
                }
                else {
                    console.warn("Not enough concepts")
                }

            }}
        >
            {editor && (
                <CollectionProvider editor={editor} collections={collections}>
                    <GraphUi />
                    <CustomToolbar />
                    <GraphTrigger />
                </CollectionProvider>
            )}

        </Tldraw>
    )
}