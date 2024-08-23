import { createShapeId, useEditor, useValue } from "tldraw"
import { useEffect } from 'react';


export function SelectionListener({ user }){
    const editor = useEditor();


    const selectedShapeIds = useValue('selectedShapeIds', () => editor.getSelectedShapeIds(), [editor])
    // const selectedShapes = editor.getSelectedShapes()
    useEffect(()=>{
        console.log("SELECTED SHAPES:", selectedShapeIds)
        if(selectedShapeIds.length === 0){
            // zoom to the name 
            const name = editor.getShape(createShapeId(user.uniqueName))

            console.log("NAME", name)
            if(name){
                editor.zoomToBounds(editor.getShapePageBounds(name), {
                    animation: {
                        duration: 300
                    },
                    targetZoom: 1,
                })
        }
            }
        else{
            // tear down all excerpts
            
        }
    }, [selectedShapeIds])
    
    return null
}