import { useEditor, useValue } from "tldraw"
import { useEffect } from 'react';
import { useLoaderData } from "@remix-run/react";

export function SelectionListener(){
    const editor = useEditor();
    const data = useLoaderData();


    const selectedShapeIds = useValue('selectedShapeIds', () => editor.getSelectedShapeIds(), [editor])
    // const selectedShapes = editor.getSelectedShapes()
    useEffect(()=>{
        console.log("SELECTED SHAPES:", selectedShapeIds)
        if(selectedShapeIds.length === 1){
            if(editor.getShape(selectedShapeIds[0]).type === 'concept'){

                // get excerpts

                
                // trigger effects
            }
        }
        else{
            // tear down all excerpts
            
        }
    }, [selectedShapeIds])
    
    return null
}