import { useState, useEffect } from "react";
import { useStarFireSync } from "~/components/synchronization/StarFireSync";
import { motion } from "framer-motion";
import SystemComponent from "~/components/canvas/custom-ui/game-ui/Narrator/components/SystemComponent";
import GameNarratorComponent from "~/components/canvas/custom-ui/game-ui/Narrator/components/GameNarratorComponent"
import styles from './OverlayPainter.module.css';

export function OverlayPainter(){
    const { overlayControls, trueOverlayControls, gameSystemText, gameNarratorText } = useStarFireSync(); // Destructure overlayControls

    const [nextButtonVisible, setNextButtonVisible] = useState(false);

    useEffect(() => {
        const tlContainer = document.querySelector('.tl-container');
        const tlBackground = document.querySelector('.tl-background');
            // rip down overlay if it exists
    
        // Apply transition duration
        const duration = overlayControls.immediate ? 0.001 : (overlayControls.duration || 2);

        console.log("overlayControls", overlayControls)

        setTimeout(()=>{
            console.log("setting delay")

            if (overlayControls.dark) {
                tlContainer?.classList.add('overlay-active');
                tlBackground?.classList.add('overlay-active');
            } else {
                tlContainer?.classList.remove('overlay-active');
                tlBackground?.classList.remove('overlay-active');
            }
            tlContainer?.style.setProperty('--overlay-transition-duration', `${duration}s`);
            tlBackground?.style.setProperty('--overlay-transition-duration', `${duration}s`);
            setTimeout(()=>{
                console.log("completing overlay controls")
                overlayControls.onComplete && overlayControls.onComplete();
            }, duration * 1000)
        }, overlayControls.delay * 1000 || 0)
        
       
      
    }, [overlayControls]);

    useEffect(()=>{
        console.log("TRUEOVERLAY", trueOverlayControls)
        if(trueOverlayControls.duration > 500){
            console.error("You accidentally set overlay duration in ms instead of seconds.")
        }
    }, [trueOverlayControls])



    // game system text is set in the general controller (NarrationPainter)
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
            console.log("true overlay complete")
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
            backgroundColor: 'black',
        }}>

        </motion.div>

        <div className={styles.textContainer}>
        <SystemComponent 
                visible={gameSystemText.visible} 
                text={gameSystemText.text} 
                requiresInteraction={gameSystemText.requiresInteraction}
                exitDuration={gameSystemText.exitDuration}
                onComplete={gameSystemText.onComplete}
                nextButtonVisible={nextButtonVisible}
                setNextButtonVisible={setNextButtonVisible}

                />
        <GameNarratorComponent 
                visible={gameNarratorText.visible} 
                text={gameNarratorText.text}
                headerText={gameNarratorText.headerText} 
                requiresInteraction={gameNarratorText.requiresInteraction}
                exitDuration={gameNarratorText.exitDuration}
                onComplete={gameNarratorText.onComplete}
                nextButtonVisible={nextButtonVisible}
                setNextButtonVisible={setNextButtonVisible}
                />
        </div>

        {/* New SVG with concave side */}
        {/* <svg className={styles.eyelid} width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
                <clipPath id="concaveClip">
                    <path d="M 0,0 L 100,0 L 100,100 Q 50,50 0,100 Z" />
                </clipPath>
            </defs>
            <rect width="100%" height="100%" style={{ fill: 'lightblue', clipPath: 'url(#concaveClip)' 
                }} />
        </svg> */}
        </>
    );
}