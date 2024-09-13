import { useEffect } from "react";
import { useStarFireSync } from "~/components/synchronization/StarFireSync";
import { motion } from "framer-motion";
import SystemComponent from "~/components/canvas/custom-ui/game-ui/Narrator/components/SystemComponent";
import NarratorComponent from "~/components/canvas/custom-ui/game-ui/Narrator/components/NarratorComponent"

export function OverlayPainter(){
    const { overlayControls, trueOverlayControls, gameSystemText, gameNarratorText } = useStarFireSync(); // Destructure overlayControls


    useEffect(() => {
        const tlContainer = document.querySelector('.tl-container');
        const tlBackground = document.querySelector('.tl-background');
            // rip down overlay if it exists
    
        if (overlayControls.dark) {
            tlContainer?.classList.add('overlay-active');
            tlBackground?.classList.add('overlay-active');
        } else {
            tlContainer?.classList.remove('overlay-active');
            tlBackground?.classList.remove('overlay-active');
        }

        // Apply transition duration
        const duration = overlayControls.immediate ? 0 : overlayControls.duration;
        tlContainer?.style.setProperty('--overlay-transition-duration', `${duration}s`);
        tlBackground?.style.setProperty('--overlay-transition-duration', `${duration}s`);
        setTimeout(()=>{
            overlayControls.onComplete && overlayControls.onComplete();
        }, duration)
      
    }, [overlayControls]);

    useEffect(()=>{
        console.log("TRUEOVERLAY", trueOverlayControls)
        if(trueOverlayControls.duration > 500){
            console.error("You accidentally set overlay duration in ms instead of seconds.")
        }
    }, [trueOverlayControls])

    useEffect(()=>{
        console.log("GAMESYSTEM", gameSystemText)
    }, [gameSystemText])

    return (
        <>
        <motion.div
        layout
        id='true-overlay'
        initial={{ opacity: 0 }}
        animate={{ opacity: trueOverlayControls.visible ? 1 : 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: trueOverlayControls.immediate ? 0 : (trueOverlayControls.duration || 0 ), 
                      delay: trueOverlayControls.delay || 0 }}
        onAnimationComplete={(animation) => {
            trueOverlayControls.onComplete && trueOverlayControls.onComplete();
        }}
        style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 9999,
            pointerEvents: 'none',
            backgroundColor: 'pink',
        }}>

        </motion.div>
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            zIndex: 9999,
        }}>
        <SystemComponent 
                visible={gameSystemText.visible} 
                text={gameSystemText.text} 
                requiresInteraction={gameSystemText.requiresInteraction}
                exitDuration={gameSystemText.exitDuration}
                onComplete={gameSystemText.onComplete}
                />
        <NarratorComponent 
                visible={gameNarratorText.visible} 
                text={gameNarratorText.text} 
                requiresInteraction={gameNarratorText.requiresInteraction}
                exitDuration={gameNarratorText.exitDuration}
                onComplete={gameNarratorText.onComplete}
                />
        </div>
        </>
    );
}