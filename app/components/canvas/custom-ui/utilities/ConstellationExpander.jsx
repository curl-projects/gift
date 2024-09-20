import { useEffect } from 'react';
import { useEditor, createShapeId } from "tldraw"
import { useConstellationMode } from './ConstellationModeContext';
import { removeProgressiveBlur, applyProgressiveBlur } from "~/components/canvas/helpers/distribution-funcs.js"

export function ConstellationExpander(){
    const editor = useEditor()
    const { expandConcepts, expandExcerpts, 
            setExpandConcepts, setExpandExcerpts, 
            expandConstellation } = useConstellationMode();

    useEffect(()=>{
       console.log("EXPAND CONSTELLATION", expandConstellation)
    }, [expandConstellation])


    useEffect(()=>{
        console.log("EXPAND COMPONENTS", expandConcepts, expandExcerpts)
     }, [expandConcepts, expandExcerpts])

    // trigger resolution if all constitution components are resolved
    useEffect(()=>{
        if(expandConstellation?.concepts){
            setExpandConcepts({ expanded: true }).then(()=>{
                console.log("HELLO!")
                if(expandConstellation?.excerpts){
                    setExpandExcerpts({ expanded: true }).then(() => {
                        expandConstellation.onComplete && expandConstellation.onComplete()
                    })
                }
                else{
                    expandConstellation.onComplete && expandConstellation.onComplete()
                }
            })
        }
    }, [expandConstellation])


    useEffect(()=>{
        if(expandConcepts.expanded){
            const nameShape = editor.getShape({id: createShapeId('andre-vacha')})
            if(nameShape){
                if(nameShape.props.expanded){
                    expandConcepts.onComplete && expandConcepts.onComplete()
                }
                else{
                    editor.updateShape({
                        id: nameShape.id,
                        type: nameShape.type,
                        props: {
                            expanded: true
                        }
                    })
                }
                
            }
        }        
    }, [expandConcepts])


    useEffect(()=>{
        if(expandExcerpts.expanded){
            const conceptShapes = editor.getCurrentPageShapes().filter(shape => shape.type === 'concept')

            const allExpanded = conceptShapes.every(concept => concept.props.expanded);
            if (!allExpanded) {
                for (let concept of conceptShapes) {
                    if (!concept.props.expanded) {
                        editor.updateShape({
                            id: concept.id,
                            type: concept.type,
                            props: {
                                expanded: true,
                            }
                        });
                    }
                }
            }
            else{
                expandExcerpts.onComplete && expandExcerpts.onComplete()
            }
        }
    }, [expandExcerpts])
}

// if(expandConstellation.concepts.expanded){
//     const nameShape = editor.getShape({id: createShapeId('andre-vacha')})
//     // get name shape

//     if(nameShape){
//         editor.updateShape({
//             id: nameShape.id,
//             type: nameShape.type,
//             props: {
//                 expanded: true
//             }
//         })

//         expandConstellation.concepts.onComplete().then(() => {
//             console.log("Concepts expanded promise resolved");
            
//             if(expandConstellation.excerpts.expanded){
//                 const conceptShapes = editor.getCurrentPageShapes().filter(shape => shape.type === 'concept')

//                 conceptShapes.map(concept => {
//                     editor.updateShape({
//                         id: concept.id,
//                         type: concept.type,
//                         props: {
//                             expanded: true
//                         }
//                     })
//                 })
//             }
//         });



//     }
//     else{
//         console.error("No name shape found")
//     }
