import { useEffect } from 'react';
import { useEditor, createShapeId } from "tldraw"
import { useConstellationMode } from './ConstellationModeContext';

export function ConstellationExpander(){
    const editor = useEditor()
    const { expandConstellation } = useConstellationMode();

    useEffect(()=>{
       console.log("EXPAND CONSTELLATION", expandConstellation)
    }, [expandConstellation])

    useEffect(()=>{
        if(expandConstellation.concepts.expanded){
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

                expandConstellation.concepts.onComplete().then(() => {
                    console.log("Concepts expanded promise resolved");
                    
                    if(expandConstellation.excerpts.expanded){
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
                });



            }
            else{
                console.error("No name shape found")
            }
        }
    }, [expandConstellation])



    return null
}