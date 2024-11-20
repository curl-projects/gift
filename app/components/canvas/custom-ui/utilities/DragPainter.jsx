import { useEffect } from "react"
import { useStarFireSync } from "~/components/synchronization/StarFireSync"

export function DragPainter(){
    const { conceptIsDragging } = useStarFireSync()

    useEffect(()=>{
        console.log("CONCEPT IS DRAGGING", conceptIsDragging)
    }, [conceptIsDragging])

    return null
}