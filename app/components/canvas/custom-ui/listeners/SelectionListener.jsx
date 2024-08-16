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
        if(selectedShapeIds.length === 0){
            // zoom to the name 
            const name = editor.getShape('geo')

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