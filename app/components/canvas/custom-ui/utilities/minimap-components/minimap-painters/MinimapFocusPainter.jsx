import { useStarFireSync } from '~/components/synchronization/StarFireSync';
import { useEffect, useState } from 'react';
import { useEditor, createShapeId } from 'tldraw';

export function MinimapFocusPainter() {
    const { minimapMode } = useStarFireSync();
    const editor = useEditor();

    useEffect(()=>{
        setTimeout(()=>{
            const shape = editor.getShape(createShapeId('minimapStar'));
            console.log("MINIMAP STAR", shape);
            if(shape){
                editor.zoomToBounds(editor.getShapePageBounds(shape), {
            animation: {
                duration: 300,
                easing: t => t * t
                },
                    targetZoom: 2,
                })
            }
        }, 300)
    }, [minimapMode.expanded])

    return null;
}