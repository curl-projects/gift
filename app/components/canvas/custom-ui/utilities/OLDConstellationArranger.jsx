import { useCollection } from '~/components/canvas/custom-ui/collections/useCollection';
import { useLayoutEffect, useEffect, useCallback } from 'react';
import { useEditor } from "tldraw"
import { useConstellationMode } from './ConstellationModeContext';

export function ConstellationArranger(){
    const editor = useEditor()
    const { expandConstellation } = useConstellationMode();

    const handleStoreEvent = useCallback((change) => {
        if(change.changes.added){
            for(const record of Object.values(change.changes.added))
                if(record.typeName === 'shape'){
                    // when a new shape is created, send all threads to the back
                    // const threads = editor.getCurrentPageShapes().filter(shape => shape.type === 'thread')
                    const concepts = editor.getCurrentPageShapes().filter(shape => shape.type === 'concept')
                    // editor.sendToBack(threads.map(thread => thread.id))  
                    editor.bringToFront(concepts.map(concept => concept.id))  
                    console.log("SENDING THREADS TO BACK!", concepts.map(concept => concept.id))              
            }
        }
    }, [editor])

    useLayoutEffect(()=>{
        const unsubscribe = editor.store.listen((change) => handleStoreEvent(change))
        return () => unsubscribe()
    }, [editor, handleStoreEvent])

    useEffect(()=>{
       console.log("EXPAND CONSTELLATION", expandConstellation)
    }, [expandConstellation])

    useEffect(()=>{
        if(expandConstellation.concepts){
            const nameShape = editor.getShape({id: createShapeId('andre-vacha')})
            // get name shape
            if(nameShape){
                editor.updateShape({
                    id: nameShape.id,
                    type: nameShape.type,
                    props: {
                        expanded: true
                    }
                })


                if(expandConstellation.excerpts){
                    const conceptShapes = editor.getCurrentPageShapes().filter(shape => shape.type === 'concept')

                    conceptShapes.map(concept => {
                        editor.updateShape({
                            id: concept.id,
                            type: concept.type,
                            props: {
                                expanded: true
                            }
                        })
                    })
                }
            }
            else{
                console.error("No name shape found")
            }
        }
    }, [expandConstellation])



    return null
}