import { createShapeId, useEditor } from 'tldraw';
import { useEffect, useLayoutEffect } from 'react';
import { createBoundThread, hasExistingThread } from '~/components/canvas/helpers/thread-funcs';
import { useCollection } from '~/components/canvas/custom-ui/collections/useCollection';
import { generatePointsAroundCircle } from "~/components/canvas/helpers/distribution-funcs";
import { useConstellationMode } from '~/components/canvas/custom-ui/utilities/ConstellationModeContext';

export function ConstellationPainter({ user }){
    const editor = useEditor();
    const { collection, size } = useCollection('graph')
    const { triggerWarp, setTriggerWarp } = useConstellationMode()

    useLayoutEffect(()=>{
        console.log("INITIAL COLLECTION:", collection)
        if(collection){
            // create central data object
            console.log("COLLECTION")
            const centralShapeId = createShapeId(user.uniqueName);

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
    }, [collection])
  
    useEffect(()=>{
        if(collection){
            const relevantShapes = editor.getCurrentPageShapes().filter(shape => ['thread', 'concept', 'excerpt', 'name'].includes(shape.type))
            collection.add(relevantShapes)
        }
    }, [collection, editor])
    
    return null
}