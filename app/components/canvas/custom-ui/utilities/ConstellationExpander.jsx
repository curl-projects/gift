import { useEffect } from 'react';
import { useEditor, createShapeId } from "tldraw"
import { useConstellationMode } from './ConstellationModeContext';
import { removeProgressiveBlur, applyProgressiveBlur } from "~/components/canvas/helpers/distribution-funcs.js"
import { useParams } from "@remix-run/react";

export function ConstellationExpander(){
    const editor = useEditor()
    const { expandConcepts, expandExcerpts, 
            setExpandConcepts, setExpandExcerpts, 
            expandConstellation } = useConstellationMode();

    useEffect(()=>{
       console.log("EXPAND CONSTELLATION", expandConstellation)
    }, [expandConstellation])

    const { person } = useParams();


    useEffect(()=>{
        console.log("EXPAND COMPONENTS", expandConcepts, expandExcerpts)
     }, [expandConcepts, expandExcerpts])

    // trigger resolution if all constitution components are resolved
    useEffect(()=>{
        const nameShape = editor.getShape({id: createShapeId(person)})

        if(expandConstellation?.concepts){
            setExpandConcepts({ expanded: true }).then(()=>{
                console.log("HELLO!")
                if(expandConstellation?.excerpts){
                    setExpandExcerpts({ expanded: true }).then(() => {

                        if(nameShape){
                            editor.zoomToBounds(editor.getShapePageBounds(nameShape), {
                                animation: {
                                    duration: 300,
                                    easing: (t) => t * t, // Quadratic ease function
                                },
                                targetZoom: 1
                            })
                        }

                        setTimeout(()=>{
                            expandConstellation.onComplete && expandConstellation.onComplete()
                        }, 300)
                    })
                }
            else{
                    setExpandExcerpts({ expanded: false })

                    if(nameShape){
                        editor.zoomToBounds(editor.getShapePageBounds(nameShape), {
                            animation: {
                                duration: 300,
                                easing: (t) => t * t, // Quadratic ease function
                            },
                            targetZoom: 1
                        })
                    }

                    setTimeout(()=>{
                        expandConstellation.onComplete && expandConstellation.onComplete()
                    }, 300)
                }
            })
        }
        else{
            setExpandConcepts({ expanded: false })
        }
        
    }, [expandConstellation])


    useEffect(()=>{
        if(expandConcepts.expanded){
            const nameShape = editor.getShape({id: createShapeId(person)})
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
        else{
            const nameShape = editor.getShape({id: createShapeId(person)})
            if(nameShape){
                editor.updateShape({
                    id: nameShape.id,
                    type: nameShape.type,
                    props: {
                        expanded: false
                    }
                })
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
        else{
            const conceptShapes = editor.getCurrentPageShapes().filter(shape => shape.type === 'concept')

            const allCollapsed = conceptShapes.every(concept => !concept.props.expanded);
            if (!allCollapsed) {
                for (let concept of conceptShapes) {
                    if (concept.props.expanded) {
                        editor.updateShape({
                            id: concept.id,
                            type: concept.type,
                            props: {
                                expanded: false,
                            }
                        });
                    }
                }
            }

        }
    }, [expandExcerpts])
}

// if(expandConstellation.concepts.expanded){
//     const nameShape = editor.getShape({id: createShapeId(person)})
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
