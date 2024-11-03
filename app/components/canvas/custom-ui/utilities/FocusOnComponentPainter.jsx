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
        let customInset = 40
        const bounds = {
            x: pageCoords.x - customInset / 4,
            y: pageCoords.y - customInset / 4 ,
            w: boundingRect.width + customInset,
            h: focusOnComponent.finalHeight + customInset
        }

        editor.zoomToBounds(bounds, {
        animation: {
                duration: 300,
                },
                // targetZoom: 1,
        })

    }, [focusOnComponent, editor])


    useEffect(() => {
        if(!focusOnComponent.active && focusOnComponent.restoreBounds){
           
           
            const animationDuration = 300

            const journal = editor.getShape({type: 'journal', id: createShapeId('journal')})

            editor.run(() => {

                const bounds = editor.getShapePageBounds(journal)

               console.log("BOUNDS:", bounds)

               const margin = window.innerHeight * 0.1;
               const offset = journalMode.position === 'left' ? window.innerWidth * journalLeftOffset : window.innerWidth * journalRightOffset;

               const newBounds = {
                x: bounds.x + offset + margin,
                y: bounds.y,
                w: bounds.w,
                h: bounds.h,
               }

               console.log("LEFT ALIGN OFFSET:", window.innerWidth * journalLeftOffset, "JOURNAL LEFT OFFSET:", journalLeftOffset, "RIGHT ALIGN OFFSET:", window.innerWidth * journalRightOffset, "JOURNAL RIGHT OFFSET:", journalRightOffset)

               setTimeout(() => {
                editor.zoomToBounds(newBounds, {
                    animation: {
                    duration: animationDuration,
                },
                    targetZoom: 1,
                })
               }, 100)
            })

            const journalLeftInitial = editor.getShapePageBounds(journal)


            setTimeout(() => {
                setJournalZooms(false)
            }, animationDuration+20)
        }

    }, [focusOnComponent, editor])

    
    return null
})

export default FocusOnComponentPainter