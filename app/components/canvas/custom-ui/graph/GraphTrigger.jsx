import { useCollection } from '~/components/canvas/custom-ui/collections/useCollection';
import { useLayoutEffect, useEffect } from 'react';
import { useEditor } from "tldraw"

function handleStoreEvent(editor, change, collection){
    if(change.changes.added){
        for(const record of Object.values(change.changes.added)){
            if(record.typeName === 'shape' && (['thread', 'concept', 'excerpt'].includes(record.type) || (record.type === 'geo' && record.props.geo === 'rectangle'))){

            const shape = editor.getShape(record.id)
            collection.add([shape])
        }
        }
    }
}

export function GraphTrigger(){
    const { collection, size } = useCollection('graph')
    const editor = useEditor()

    useLayoutEffect(()=>{
        const relevantShapes = editor.getCurrentPageShapes().filter(shape => ['thread', 'concept', 'excerpt'].includes(shape.type) || shape.type === 'geo' && shape.props.geo === 'rectangle')
        collection.add(relevantShapes)

        editor.zoomToBounds(editor.getShapePageBounds(relevantShapes.find(shape => shape.type === 'geo' && shape.props.geo === 'rectangle')), {
            animation: {
                duration: 400
            },
            targetZoom: 1,
        })
    }, [])

    useLayoutEffect(()=>{
        editor.store.listen((change) => handleStoreEvent(editor, change, collection))
    }, [])

    return null
}