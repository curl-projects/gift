import { createShapeId, useEditor } from 'tldraw';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createBoundThread, hasExistingThread } from '~/components/canvas/helpers/thread-funcs';
import { useCollection } from '~/components/canvas/custom-ui/collections/useCollection';
import { generatePointsAroundCircle } from "~/components/canvas/helpers/distribution-funcs";
import { useStarFireSync } from "~/components/synchronization/StarFireSync"

export function ConstellationPainter({ user, isLoading, isSuccess }){
    const editor = useEditor();
    const { collection, size } = useCollection('graph')
    const { triggerWarp, setTriggerWarp, deleteStar, setDeleteStar, setOverlayControls, setCloudDarkeningControls } = useStarFireSync()

    const [startListening, setStartListening] = useState(false);


    useEffect(()=>{
        console.log("CONSTELLATION PAINTER IS LOADING:", isLoading)
    }, [isLoading])

    useEffect(()=>{
        console.log("DELETE STAR:", deleteStar)
        if(deleteStar.deleted){
            // delete logic happens in NameShapeUtil
        }
        else if(deleteStar.created){
            console.log("CREATED STAR:", deleteStar)
            if(deleteStar.id){
                const nameShape = editor.getShape(deleteStar.id)
                if(!nameShape){
                    console.log("CREATING STAR")
                    createConstellationStar(editor, collection, deleteStar.id)
                    deleteStar.onComplete && deleteStar.onComplete()
                    setDeleteStar({ created: false, id: null })
                    
                }
            }
            else{
                console.error("Deleted star has no name:", deleteStar)
            }
        }
    }, [deleteStar])


    function createConstellationStar(editor, collection, name){
        console.log("CREATE CONSTELATION STAR:", name)
        const centralShapeId = name;

        const centralShape = editor.getShape(centralShapeId)
        if (!centralShape) {
            console.log("CENTRAL SHAPE ID:", centralShapeId)
            editor.createShape({
                id: centralShapeId,
                type: 'name',
                x: -42, // Half the width to center it
                y: -42,  // Half the height to center it
                props: {
                    w: 200,
                    h: 100,
                    name: user.name,
                },
            });

            const relevantShapes = editor.getCurrentPageShapes().filter(shape => ['thread', 'concept', 'excerpt', 'name'].includes(shape.type))
            collection.add(relevantShapes)
            collection.startSimulation()
        }
    }

    // useLayoutEffect(()=>{
    //     console.log("INITIAL COLLECTION:", collection)
    //     if(collection && !deleteStar.deleted && !isLoading){
    //         createConstellationStar(editor, collection, createShapeId(user.uniqueName))
    //     }
    // }, [collection, deleteStar])


    useEffect(()=>{
        console.log("TRIGGER WARP:", triggerWarp)
        if(triggerWarp.active){
            editor.zoomIn(editor.getViewportScreenCenter(), {
                animation: {
                    duration: triggerWarp.accDuration,
                    easing: (t) => t * t, // Quadratic ease function
                }
            })

            setTimeout(()=>{
                // delete all shapes once they pass out of the viewport
                const constellationShapes = editor.getCurrentPageShapes().filter(shape => ['thread', 'concept', 'excerpt', 'name', 'annotation', "drift"].includes(shape.type))

                // allows us to override thread locks
                editor.run(
                    () => {
                        editor.deleteShapes(constellationShapes.map(shape => shape.id))
                    }, {
                        ignoreShapeLock: true
                    }
                )
    
                // reset the zoom
                editor.resetZoom(editor.getViewportScreenCenter())

                setStartListening(true);

                // this timeout needs to be replaced with a trigger that listens for when isLoading changes back to false
                // setTimeout(()=>{
                //     // todo -- this will become a new user when that system exists

                //     // console.log("NEW LOCATION:", location)

                //     createConstellationStar(editor, collection, createShapeId(user.uniqueName))
                // }, triggerWarp.constAccDuration + triggerWarp.deaccDuration * 0.05)

                // Once the zoom has been
            }, triggerWarp.accDuration)
        }
    }, [triggerWarp])


    //  listens for loading transition and creates the star once loading has concluded
    useEffect(() => {
        console.log("START LISTENING:", startListening)
        console.log("IS SUCCESS:", isSuccess)

        if (startListening) {
            // Check if isLoading transitions from true to false
            if (isSuccess) {
                console.log("SETTING OVERLAY CONTROLS:", user.startColor, user.endColor)
                console.log("isLoading transitioned from true to false, creating constellation star", user);
                createConstellationStar(editor, collection, createShapeId(user.uniqueName));

                setOverlayControls({ startColor: user.startColor, endColor: user.endColor, immediate: false, duration: 0.5, delay: 0}),
                setCloudDarkeningControls({ visible: true, colors: user.darkeningColors, immediate: false, duration: 0.5, delay: 0}),

                // Dispose of the listener
                setStartListening(false);
            }
        }
    }, [isSuccess, startListening]);

  
    useEffect(()=>{
        if(collection){
            const relevantShapes = editor.getCurrentPageShapes().filter(shape => ['thread', 'concept', 'excerpt', 'name'].includes(shape.type))
            collection.add(relevantShapes)
        }
    }, [collection, editor])
    
    return null
}