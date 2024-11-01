import styles from './ConnectCardFunctionality.module.css'
import { useStarFireSync } from "~/components/synchronization/StarFireSync"
import { useRef, useEffect } from "react"
import { createShapeId } from "tldraw"

export function ConnectCardFunctionality({ covenantCardRef, tldrawEditor }){
    const { setJournalZooms, setFocusOnComponent, focusOnComponent } = useStarFireSync()

    useEffect(() => {
        function handleClickOutside(event) {
            console.log("CLICK GENERAL:", focusOnComponent, covenantCardRef.current.contains(event.target))
            if (focusOnComponent.active && focusOnComponent.component === 'mainClause' && covenantCardRef.current && !covenantCardRef.current.contains(event.target)) {
                // Trigger your new functionality here

                
                // setJournalZooms(false)
                setFocusOnComponent({ 
                        active: false, restoreBounds: true,
                        prevBounds: focusOnComponent.prevBounds, prevZoom: focusOnComponent.prevZoom, 
                        prevViewportCenter: focusOnComponent.prevViewportCenter })
    
                // remove event listener
            }
        }
        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [covenantCardRef, focusOnComponent]);

    return(
        <div 
            className={styles.connectToThoughtBox} 
            onClick={(e) => {
                if(!focusOnComponent.component === 'mainClause'){
                console.log("INITIAL JOURNAL POSITION:", tldrawEditor.getShapePageBounds(tldrawEditor.getShape({type: 'journal', id: createShapeId('journal')})))
                console.log("GETTING INITIAL VIEWPORT PAGE BOUNDS: ", tldrawEditor.getViewportPageBounds(), "ZOOM LEVEL: ", tldrawEditor.getZoomLevel())
                setJournalZooms(true)

                setTimeout(() => {
                    console.log("GETTING VIEWPORT PAGE BOUNDS: ", tldrawEditor.getViewportPageBounds(), "ZOOM LEVEL: ", tldrawEditor.getZoomLevel())
                    setFocusOnComponent({ active: true, component: 'mainClause', componentRef: covenantCardRef, 
                        opacity: 0.1, 
                        prevBounds: tldrawEditor.getViewportPageBounds(), 
                        prevZoom: tldrawEditor.getZoomLevel(),
                        prevViewportCenter: tldrawEditor.getViewportScreenCenter()
                    })
                }, 100)

                e.stopPropagation()
                console.log("CLICKED")
            }
            }}>
            Attach thought
        </div>
    )
}