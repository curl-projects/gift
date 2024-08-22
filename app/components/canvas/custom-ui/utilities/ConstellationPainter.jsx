import { createShapeId, useEditor } from 'tldraw';
import { useEffect, useLayoutEffect } from 'react';
import { createBoundThread, hasExistingThread } from '~/components/canvas/helpers/thread-funcs';
import { useCollection } from '~/components/canvas/custom-ui/collections/useCollection';
import { generatePointsAroundCircle } from "~/components/canvas/helpers/distribution-funcs";

export function ConstellationPainter({ user }){
    const editor = useEditor();
    const { collection, size } = useCollection('graph')

    useLayoutEffect(()=>{
        console.log("INITIAL COLLECTION:", collection)
        if(collection){
            // create central data object
            console.log("COLLECTION")
            const centralShapeId = createShapeId('name');

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
        




        // const { x: centerX, y: centerY} = editor.getShape(centralShapeId)
        // const points = generatePointsAroundCircle(centerX, centerY, 200, user.concepts.length, 0);
        
        // for(let i = 0; i < user.concepts.length; i++){
        //     let concept = user.concepts[i]
        //     let conceptId = createShapeId(concept.id)
        //     let { x, y } = points[i]
        //     editor.createShape({
        //         id: conceptId,
        //         type: 'concept',
        //         x: x,
        //         y: y,
        //         props: {
        //             databaseId: concept.id,
        //             text: concept.title,
        //             plainText: concept.title,
        //             description: concept.description,
        //         }
        //     })
        //     createBoundThread(editor, centralShapeId, conceptId)
        // }

        // // // create threads
        // // const conceptShapes = editor.getCurrentPageShapes().filter(shape => shape.type === 'concept')

        // // for(let conceptShape of conceptShapes){
        // //     createBoundThread(editor, centralShapeId, conceptShape.id)
        // // }

        // //  create bound threads based on concept connections
        //  for(let concept of user.concepts){
        //     for(let linkedConcept of concept.linkedEnd){
        //         if(!hasExistingThread(editor, createShapeId(concept.id), createShapeId(linkedConcept.linkedStart.id))){
        //             createBoundThread(editor, createShapeId(concept.id), createShapeId(linkedConcept.linkedStart.id))
        //         }
        //     }
        // }
        // editor.zoomToBounds(editor.getShapePageBounds(relevantShapes.find(shape => shape.type === 'name')), {
        //     animation: {
        //         duration: 400
        //     },
        //     targetZoom: 1,
        // })


    }, [collection])

    useEffect(()=>{
        if(collection){
            const relevantShapes = editor.getCurrentPageShapes().filter(shape => ['thread', 'concept', 'excerpt', 'name'].includes(shape.type))
            collection.add(relevantShapes)
        }
    }, [collection, editor])
    
    return null
}