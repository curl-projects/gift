import { useCollection } from '~/components/canvas/custom-ui/collections/useCollection';
import { useLayoutEffect, useEffect, useCallback } from 'react';
import { useEditor } from "tldraw"

export function GraphTrigger(){
    // const { collection, size } = useCollection('graph')
    // const { collection: annotationCollection, size: annotationSize } = useCollection('annotation')
    // const editor = useEditor()

    // const handleStoreEvent = useCallback((change) => {
    //     if(change.changes.added){
    //         for(const record of Object.values(change.changes.added)){
    //             if(record.typeName === 'shape' && (['thread', 'concept', 'excerpt', 'name'].includes(record.type))){
    //                 const shape = editor.getShape(record.id)
    //                 collection.add([shape])
    //             }
    //             // else if(record.typeName === 'shape' && record.type === 'annotation'){
    //             //     const shape = editor.getShape(record.id)
    //             //     annotationCollection.add([shape])
    //             // }
    //         }
    //     }
    // }, [editor, collection])

    // useLayoutEffect(()=>{
    //     if(collection){
    //         const unsubscribe = editor.store.listen((change) => handleStoreEvent(change))
    //         return () => unsubscribe()
    //     }
    // }, [editor, collection, handleStoreEvent])

    return null
}