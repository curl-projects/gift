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

    const { focusOnComponent, setJournalZooms, journalMode } = useStarFireSync()

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
            const journal = editor.getShape({type: 'journal', id: createShapeId('journal')})

            editor.run(() => {

                const bounds = editor.getShapePageBounds(journal)


               console.log("BOUNDS:", bounds)

               const margin = window.innerHeight * 0.1;
               const offset = journalMode.position === 'left' ? window.innerWidth * journalLeftOffset : window.innerWidth * journalRightOffset;

               const newBounds = {
                // x: bounds.x + 0.30*bounds.w - 1,
                x: bounds.x + offset + margin,
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

            const journalLeftInitial = editor.getShapePageBounds(journal)


            setTimeout(() => {
                setJournalZooms(false)
                setTimeout(() => {
                    const journalLeftFinal = editor.getShapePageBounds(journal)
                    console.log("WINDOW:", window.innerWidth, window.innerHeight)
                    console.log("MARGIN:", window.innerHeight * 0.1)
                    console.log("OFFSET:", window.innerWidth * journalLeftOffset, window.innerWidth * journalRightOffset)
                    console.log("JOURNAL LEFT OFFSET:", journalLeftOffset, "JOURNAL RIGHT OFFSET:", journalRightOffset)
                    console.log("JOURNAL LEFT INITIAL:", journalLeftInitial, "JOURNAL LEFT FINAL:", journalLeftFinal)
                }, 100)
            }, animationDuration+20)
        }

    }, [focusOnComponent, editor])

    
    return null
})

export default FocusOnComponentPainter

// partially closed
// x: -498.8925  -> -.485.9925 = 12.9


// fully open
// x: -175.4999 -> - 136.8399 = 38.66

// UNADJUSTED
// x: -175.49999 - -408.99997 = 233.5

