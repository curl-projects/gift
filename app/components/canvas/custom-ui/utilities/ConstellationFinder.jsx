import { useConstellationMode } from '~/components/canvas/custom-ui/utilities/ConstellationModeContext';
import { useEffect } from 'react';
import { useEditor } from 'tldraw';

export function ConstellationFinder(){
    const { expandedShapeIds, setExpandedShapeIds } = useConstellationMode()
    const editor = useEditor()

    const delayTimes = {
        'name': 1500,
        'concept': 1000,
        'excerpt': 500,
    }

    useEffect(()=>{
        console.log("EXPANDED SHAPES", expandedShapeIds)
        const expandShapes = async () => {
            for (let shapeId of expandedShapeIds) {
                console.log("SHAPE ID", shapeId)
                const shape = await editor.getShape(shapeId);
                console.log("SHAPE", shape)
                if (shape) {
                    editor.updateShape({id: shape.id, type: shape.type, props: { expanded: true } });
                    editor.select(shape.id)
                    console.log("SHAPE", shape);
                    await new Promise(resolve => setTimeout(resolve, delayTimes[shape.type] || 500));
                }
            }
        };
        
        (expandedShapeIds && expandedShapeIds.length !==0 && editor) && expandShapes();
        
    }, [expandedShapeIds, editor])


    
    // constellation finder should be passed an array of shapes

    // it should expand the graph until all of those shapes are visible

    // how do we do this systematically

    // it should then apply blur to all other shapes in the graph collection
}