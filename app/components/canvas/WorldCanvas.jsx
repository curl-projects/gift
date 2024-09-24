import { useState, useLayoutEffect, useEffect, useMemo } from 'react';
import { useNavigation, useLoaderData, useRouteError } from '@remix-run/react';

import _ from 'lodash'
import { Tldraw, createTLStore, defaultShapeUtils, defaultBindingUtils, DefaultSpinner, getSnapshot, loadSnapshot, useEditor, createShapeId, useValue } from 'tldraw';
import { ClientOnly } from 'remix-utils/client-only';

// CUSTOM UI
import { ConstellationModeProvider } from "~/components/canvas/custom-ui/utilities/ConstellationModeContext"
// import { ConstellationFinder } from "~/components/canvas/custom-ui/utilities/ConstellationFinder"
import { ConstellationPainter } from "~/components/canvas/custom-ui/utilities/ConstellationPainter"
import { ConstellationExpander } from "~/components/canvas/custom-ui/utilities/ConstellationExpander"
import { DriftPainter } from "~/components/canvas/custom-ui/utilities/DriftPainter"
import { GlyphPainter } from "~/components/canvas/custom-ui/utilities/GlyphPainter"
import { TitlePainter } from "~/components/canvas/custom-ui/utilities/TitlePainter"
import { JournalPainter } from "~/components/canvas/custom-ui/utilities/JournalPainter"
import { ResizePainter } from "~/components/canvas/custom-ui/utilities/ResizePainter"
import { CovenantPainter } from "~/components/canvas/custom-ui/utilities/CovenantPainter"
import { ToolsMenu } from "~/components/canvas/custom-ui/utilities/ToolsMenu"
import { NarrationPainter } from "~/components/canvas/custom-ui/game-ui/Narrator/NarrationPainter"
import { GameController } from "~/components/canvas/custom-ui/game-ui/GameControls/GameController"
import CustomToolbar from "~/components/canvas/custom-ui/custom-toolbar/CustomToolbar"
import { CollectionProvider } from "~/components/canvas/custom-ui/collections";
import { MainMenuPainter } from "~/components/canvas/custom-ui/utilities/MainMenuPainter";
import { GraphLayoutCollection } from "~/components/canvas/custom-ui/graph/GraphLayoutCollection";
import { AnnotationLayoutCollection } from "~/components/canvas/custom-ui/graph/AnnotationLayoutCollection";
import { GraphUi } from "~/components/canvas/custom-ui/graph/GraphUi";
import { GraphTrigger } from "~/components/canvas/custom-ui/graph/GraphTrigger";
import { SelectionListener } from "~/components/canvas/custom-ui/listeners/SelectionListener";
import { ConstellationLabel } from "~/components/canvas/custom-ui/game-ui/ConstellationLabel"
import { Stars } from '~/components/canvas/custom-ui/aesthetics/stars/Stars';
import { WarpStars } from '~/components/canvas/custom-ui/aesthetics/warp-stars/WarpStars';
import { Clouds } from './custom-ui/aesthetics/clouds/Clouds';
import { NarratorVoice } from "./custom-ui/game-ui/Narrator/NarratorVoice"
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

import { JournalShapeUtil } from "~/components/canvas/shapes/journal-shape/JournalShapeUtil"

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

    const shapeUtils = [ConceptShapeUtil, ExcerptShapeUtil, ThreadShapeUtil, NameShapeUtil, DriftShapeUtil, AnnotationShapeUtil, JournalShapeUtil]
    const tools = [ConceptShapeTool, ExcerptShapeTool, ThreadShapeTool, NameShapeTool]
    const bindingUtils = [ThreadBindingUtil, AnnotationBindingUtil]
    const collections = [GraphLayoutCollection, 
        // AnnotationLayoutCollection
    ]
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

                        // hack so that we can use zoomIn for constellation transitions
                        // controls max and min zoom with trackpad and with zoomIn and zoomOut
                        editor.setCameraOptions({
                            zoomSteps: [0.1, 500]
                        })
                    }}
                >
                    {editor && (
                        <>
                            {/* <GraphUi /> */}
                            <DriftPainter 
                                user={data.user}
                            />
                            <ConstellationPainter 
                                user={data.user} 
                            />
                            <GlyphPainter />
                            <TitlePainter />
                            <JournalPainter />
                            <MainMenuPainter />
                            <CovenantPainter />
                            <ResizePainter />
                            <NarrationPainter />
                            {/* <ConstellationFinder /> */}
                            {/* <CustomToolbar /> */}
                            <ConstellationLabel 
                                name={data.user.name}
                            />
                            <ToolsMenu />
                            <GraphTrigger />
                            <SelectionListener 
                                user={data.user}
                            />
                            <ConstellationExpander />
                            <Stars />
                            <WarpStars />
                            <Clouds />
                            <NarratorVoice />
                        </>
                    )}
                </Tldraw>
            </CollectionProvider>
        </ConstellationModeProvider>
    )
}