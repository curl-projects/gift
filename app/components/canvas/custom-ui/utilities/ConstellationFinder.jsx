import { useConstellationMode } from '~/components/canvas/custom-ui/utilities/ConstellationModeContext';
import { useEffect } from 'react';

export function ConstellationFinder(){
    const { expandedShapes, setExpandedShapes } = useConstellationMode()

    useEffect(()=>{
        console.log("EXPANDED SHAPES", expandedShapes)
    }, [expandedShapes])
    
    // constellation finder should be passed an array of shapes

    // it should expand the graph until all of those shapes are visible

    // how do we do this systematically

    // it should then apply blur to all other shapes in the graph collection
}