import { useState, useLayoutEffect, useEffect, useMemo } from 'react';
import { useNavigation, useLoaderData, useRouteError } from '@remix-run/react';

import _ from 'lodash'
import { Tldraw, createTLStore, defaultShapeUtils, defaultBindingUtils, DefaultSpinner, getSnapshot, loadSnapshot, useEditor, createShapeId, useValue } from 'tldraw';
import { ClientOnly } from 'remix-utils/client-only';

// CUSTOM UI
import { ConstellationModeProvider } from "~/components/canvas/custom-ui/utilities/ConstellationModeContext"
import { ConstellationFinder } from "~/components/canvas/custom-ui/utilities/ConstellationFinder"
import { ConstellationPainter } from "~/components/canvas/custom-ui/utilities/ConstellationPainter"
import { DriftPainter } from "~/components/canvas/custom-ui/utilities/DriftPainter"
import CustomToolbar from "~/components/canvas/custom-ui/custom-toolbar/CustomToolbar"
import { CollectionProvider } from "~/components/canvas/custom-ui/collections";
import { GraphLayoutCollection } from "~/components/canvas/custom-ui/graph/GraphLayoutCollection";
import { GraphUi } from "~/components/canvas/custom-ui/graph/GraphUi";
import { GraphTrigger } from "~/components/canvas/custom-ui/graph/GraphTrigger";
import { SelectionListener } from "~/components/canvas/custom-ui/listeners/SelectionListener";
import { ConstellationLabel } from "~/components/canvas/custom-ui/game-ui/ConstellationLabel"
import { Stars } from './custom-ui/aesthetics/stars/Stars';
import { Clouds } from './custom-ui/aesthetics/clouds/Clouds';
import { handleDoubleClickOnCanvas } from '~/components/canvas/helpers/canvasOverride';

// CUSTOM SHAPES
import { NameShapeUtil } from "~/components/canvas/shapes/name-shape/NameShapeUtil"
import { NameShapeTool } from "~/components/canvas/shapes/name-shape/NameShapeTool"

import { ConceptShapeUtil } from "~/components/canvas/shapes/concept-shape/ConceptShapeUtil"
import { ConceptShapeTool } from "~/components/canvas/shapes/concept-shape/ConceptShapeTool"

import { ExcerptShapeUtil } from "~/components/canvas/shapes/excerpt-shape/ExcerptShapeUtil"
import { ExcerptShapeTool } from "~/components/canvas/shapes/excerpt-shape/ExcerptShapeTool"

import { ThreadShapeUtil } from "~/components/canvas/shapes/thread-shape/ThreadShapeUtil"
import { ThreadShapeTool } from "~/components/canvas/shapes/thread-shape/ThreadShapeTool"
import { ThreadBindingUtil} from "~/components/canvas/bindings/thread-binding/ThreadBindingUtil"

import { DriftShapeUtil } from "~/components/canvas/shapes/drift-shape/DriftShapeUtil"

import { AnnotationShapeUtil } from "~/components/canvas/shapes/annotation-shape/AnnotationShapeUtil"
import { AnnotationBindingUtil } from "~/components/canvas/bindings/annotation-binding/AnnotationBindingUtil"

// HELPERS
import { createBoundThread, hasExistingThread } from '~/components/canvas/helpers/thread-funcs';

export default function WorldCanvas() {
    const [editor, setEditor] = useState(null)
    const data = useLoaderData();
    const navigation = useNavigation();
    const error = useRouteError();

    useEffect(() => {
        console.log("EDITOR:", editor)
    }, [editor])

    const shapeUtils = [ConceptShapeUtil, ExcerptShapeUtil, ThreadShapeUtil, NameShapeUtil, DriftShapeUtil, AnnotationShapeUtil]
    const tools = [ConceptShapeTool, ExcerptShapeTool, ThreadShapeTool, NameShapeTool]
    const bindingUtils = [ThreadBindingUtil, AnnotationBindingUtil]
    const collections = [GraphLayoutCollection]
    const components = {
        Toolbar: null,
        MainMenu: null,
        DebugMenu: null,
        // DebugPanel: null,
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

    const overrides = {
        //[a]
        actions(_editor, actions) {

            const newActions = {
                ...actions,
                'delete': { ...actions['delete'], kbd: '' },
            }
    
            return newActions
        },
        //[b]
        tools(_editor, tools) {
            const newTools = { ...tools, 
                // draw: { ...tools.draw, kbd: 'p' } 
            }
            return newTools
        },
    }

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
        <ConstellationModeProvider>
            <CollectionProvider editor={editor} collections={collections}>
                <Tldraw
                    store={store}
                    shapeUtils={shapeUtils}
                    bindingUtils={bindingUtils}
                    tools={tools}
                    overrides={overrides}
                    components={components}
                    onMount={(editor) => {
                        setEditor(editor)
                        editor.root.children.select.children.idle.handleDoubleClickOnCanvas = function(info) {
                            handleDoubleClickOnCanvas.call(this, info)
                          }.bind({ editor, parent: editor.root.children.select.children.idle.parent });  
                    }}
                >
                    {editor && (
                        <>
                            <GraphUi />
                            <DriftPainter 
                                user={data.user}
                            />
                            <ConstellationPainter 
                                user={data.user} 
                            />
                            <ConstellationFinder />
                            <CustomToolbar />
                            <ConstellationLabel 
                                name={data.user.name}
                            />
                            <GraphTrigger />
                            <SelectionListener 
                                user={data.user}
                            />
                            <Stars />
                            <Clouds />
                        </>
                    )}

                </Tldraw>
            </CollectionProvider>
        </ConstellationModeProvider>
    )
}