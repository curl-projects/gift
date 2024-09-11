import { createShapeId, useEditor } from 'tldraw';
import { useEffect, useLayoutEffect } from 'react';
import { createBoundThread, hasExistingThread } from '~/components/canvas/helpers/thread-funcs';
import { useCollection } from '~/components/canvas/custom-ui/collections/useCollection';
import { generatePointsAroundCircle } from "~/components/canvas/helpers/distribution-funcs";
import { useStarFireSync } from "~/components/synchronization/StarFireSync"

export function ConstellationPainter({ user }){
    const editor = useEditor();
    const { collection, size } = useCollection('graph')
    const { triggerWarp, setTriggerWarp } = useStarFireSync()

    function createConstellationStar(name){
        const centralShapeId = createShapeId(name);

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

    useLayoutEffect(()=>{
        console.log("INITIAL COLLECTION:", collection)
        if(collection){
            createConstellationStar(user.uniqueName)
        }
    }, [collection])

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
                // delete all shapes
                const constellationShapes = editor.getCurrentPageShapes().filter(shape => ['thread', 'concept', 'excerpt', 'name', 'annotation'].includes(shape.type))
                const constellationThreads = constellationShapes.filter(shape => shape.type === 'thread')

                editor.updateShapes(constellationThreads.map(shape => ({type: shape.type, id: shape.id, isLocked: false})))

                editor.deleteShapes(constellationShapes.map(shape => shape.id))

                // reset the zoom
                editor.resetZoom(editor.getViewportScreenCenter())

                setTimeout(()=>{
                    // todo -- this will become a new user when that system exists
                    createConstellationStar(user.uniqueName)
                }, triggerWarp.constAccDuration + triggerWarp.deaccDuration * 0.05)

                // Once the zoom has been
            }, triggerWarp.accDuration)
        }
    }, [triggerWarp])
  
    useEffect(()=>{
        if(collection){
            const relevantShapes = editor.getCurrentPageShapes().filter(shape => ['thread', 'concept', 'excerpt', 'name'].includes(shape.type))
            collection.add(relevantShapes)
        }
    }, [collection, editor])
    
    return null
}