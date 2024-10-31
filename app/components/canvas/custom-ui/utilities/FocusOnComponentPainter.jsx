import { useEffect } from "react"
import { useStarFireSync } from "~/components/synchronization/StarFireSync"
import { useEditor, track, Vec, createShapeId } from "tldraw"
import { journalRightOffset, journalLeftOffset } from "~/components/canvas/shapes/journal-shape/JournalShapeUtil"

const customScreenToPage = (editor, point) => {
    const { x: cx, y: cy, z: cz = 1 } = editor.getCamera();
    console.log("EDITOR:", editor)
    return new Vec(
        (point.x - editor.viewport.width / 2) / cz + cx,
        (point.y - editor.viewport.height / 2) / cz + cy,
        point.z ?? 1
    );
}

const FocusOnComponentPainter = track(() => {
    const editor = useEditor()

    const { focusOnComponent, setJournalZooms } = useStarFireSync()

    useEffect(() => {
        if(!focusOnComponent.componentRef || !focusOnComponent.active){
            console.log("SOMETHING'S NOT ACTIVE", focusOnComponent)
            return
        }

        console.log("SOMETHING'S ACTIVE", focusOnComponent)

        const boundingRect = focusOnComponent.componentRef.current.getBoundingClientRect()
        const pageCoords = editor.screenToPage({x: boundingRect.left, y: boundingRect.top})
        console.log("BOUNDING RECT:", boundingRect)
        console.log("PAGE COORDS:", pageCoords)
        console.log("EDITOR:", editor)
        const bounds = {
            x: pageCoords.x,
            y: pageCoords.y,
            w: boundingRect.width,
            h: boundingRect.height
        }

        setTimeout(() => {
        editor.zoomToBounds(bounds, {
        animation: {
                duration: 300,
                },
                // targetZoom: 1,
            })
            
        }, 10)
    }, [focusOnComponent, editor])


    useEffect(() => {
        if(!focusOnComponent.active && focusOnComponent.restoreBounds){
           
           
            const animationDuration = 300
            console.log("PREV BOUNDS:", focusOnComponent.prevBounds, "PREV ZOOM:", focusOnComponent.prevZoom, "PREV VIEWPORT CENTER:", focusOnComponent.prevViewportCenter)

            const bounds = {
                x: focusOnComponent.prevBounds.x,
                y: focusOnComponent.prevBounds.y,
                w: focusOnComponent.prevBounds.w,
                h: focusOnComponent.prevBounds.h,
                z: 1,
            }

            editor.run(() => {
                const journal = editor.getShape({type: 'journal', id: createShapeId('journal')})

                const bounds = editor.getShapePageBounds(journal)

               console.log("BOUNDS:", bounds)

               const newBounds = {
                x: bounds.x + 0.30*bounds.w - 1,
                y: bounds.y,
                w: bounds.w,
                h: bounds.h,
               }

               console.log("LEFT ALIGN OFFSET:", window.innerWidth * journalLeftOffset, "JOURNAL LEFT OFFSET:", journalLeftOffset, "RIGHT ALIGN OFFSET:", window.innerWidth * journalRightOffset, "JOURNAL RIGHT OFFSET:", journalRightOffset)

                editor.zoomToBounds(newBounds, {
                    animation: {
                    duration: animationDuration,
                },
                    targetZoom: 1,
                })
            })
            
            setTimeout(() => {
                setJournalZooms(false)
            }, animationDuration+20)
        }

    }, [focusOnComponent, editor])

    
    return null
})

export default FocusOnComponentPainter