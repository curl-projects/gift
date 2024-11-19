import { createShapeId, useEditor, useValue } from "tldraw"
import { useEffect } from 'react';


export function SelectionListener({ user }){
    const editor = useEditor();


    const selectedShapeIds = useValue('selectedShapeIds', () => editor.getSelectedShapeIds(), [editor])
    // const selectedShapes = editor.getSelectedShapes()
    useEffect(()=>{
        selectedShapeIds && selectedShapeIds.length > 0 && console.log("SELECTED SHAPES:", editor.getShape(selectedShapeIds[0]))
        if(selectedShapeIds.length === 0){
            // zoom to the name 
            const name = editor.getShape(createShapeId(user.uniqueName))


            if(name){
                console.log("ZOOMING TO BOUNDS")
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