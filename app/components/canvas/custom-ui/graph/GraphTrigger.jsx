import { useCollection } from '~/components/canvas/custom-ui/collections/useCollection';
import { useLayoutEffect } from 'react';


function handleStoreEvent(change, collection){
    for(const record of Object.values(change.changes.added)){
        if(record.typeName === 'shape' && (['arrow', 'concept', 'excerptShapes'].includes(record.type) || (record.type === 'geo' && record.props.geo === 'rectangle'))){

            console.log("SHAPE ID:", record.id)
            collection.add([record.id])
        }
    }
}

export function GraphTrigger(){
    const { collection, size } = useCollection()
    useLayoutEffect(()=>{
        editor.store.listen((change) => handleStoreEvent(change, collection))
    }, [])

    return null
}