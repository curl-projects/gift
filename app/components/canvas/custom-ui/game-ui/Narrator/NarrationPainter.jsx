import { useState, useEffect, useCallback } from "react"
import { useStarFireSync } from "~/components/synchronization/StarFireSync"
import { useConstellationMode } from "~/components/canvas/custom-ui/utilities/ConstellationModeContext"
import NarratorComponent from "~/components/canvas/custom-ui/game-ui/Narrator/components/NarratorComponent.jsx"
import SystemComponent from "~/components/canvas/custom-ui/game-ui/Narrator/components/SystemComponent.jsx"

export function NarrationPainter(){
    const { textEvent, setTextEvent, gameSystemText, gameNarratorText, 
            setGameSystemText, setGameNarratorText, narratorText, systemText, 
            setNarratorText, setSystemText } = useStarFireSync();
    
    const handleKeyDown = useCallback((event, setState) => {
        if (event.key === ' ') {
            console.log('triggering listener!')
            window.removeEventListener('keydown', handleKeyDown);
            event.preventDefault();
            textEvent.onComplete && textEvent.onComplete();
        
            // console.log("textEvent in listener", textEvent)
            // if(textEvent.waitForCompletion) {
            //     setTimeout(() => {
            //         console.log('text event completing', textEvent.onComplete)
            //         textEvent.onComplete && textEvent.onComplete();
            //     }, 2000) // currently hard-coded, but can change this
            // } else {
            //     textEvent.onComplete && textEvent.onComplete();
            // }  
        }
    }, [textEvent]);

    useEffect(()=>{
        if(textEvent){
            console.log("TEXT EVENT", textEvent)

            // Check if textEvent has required keys
            if (!textEvent.hasOwnProperty('type') || 
                !textEvent.hasOwnProperty('overlay') || 
                !textEvent.hasOwnProperty('visible') || 
                !textEvent.hasOwnProperty('onComplete')) {
                console.error("textEvent is missing required keys");
                return;
            }
            
            // determine what state to work with
            const setState = textEvent.type === "system" 
                ? (textEvent.overlay ? setGameSystemText : setSystemText) 
                : (textEvent.overlay ? setGameNarratorText : setNarratorText);

            // const setOtherState = textEvent.type === "system" 
            //     ? (textEvent.overlay ? setGameNarratorText : setNarratorText) 
            //     : (textEvent.overlay ? setGameSystemText : setSystemText);


            if(!textEvent.visible){
                setState({ visible: false, text: "", requiresInteraction: false })
            }

            else if(textEvent.requiresInteraction){
                // trigger state change
                console.log("TEXT EVENT REQUIRES INTERACTION")

                if(textEvent.waitUntilVisible){
                    setState({ visible: true, text: textEvent.text, requiresInteraction: textEvent.requiresInteraction, 
                            darkeningVisible: textEvent.darkeningVisible, darkeningDuration: textEvent.darkeningDuration }).then(()=>{
                        console.log("adding listener once visible")
                        window.addEventListener('keydown', (event) => handleKeyDown(event, setState));
                    })
                }
                else{
                    setState({ visible: true, text: textEvent.text, requiresInteraction: textEvent.requiresInteraction, 
                        darkeningVisible: textEvent.darkeningVisible, darkeningDuration: textEvent.darkeningDuration })
                    console.log("adding listener immediately")
                    window.addEventListener('keydown', (event) => handleKeyDown(event, setState));
                }

               

            }
            else if(textEvent.duration){
                // trigger state change
                Promise.all([
                    // setOtherState({ visible: false, text: '', requiresInteraction: false }),
                    setState({ visible: true, text: textEvent.text, requiresInteraction: textEvent.requiresInteraction, 
                                darkeningVisible: textEvent.darkeningVisible, darkeningDuration: textEvent.darkeningDuration })
                ]).then(()=>{
                    // once the animation has resolved, resolve the text event
                    setTimeout(() => {
                        setState({ visible: false, text: "", requiresInteraction: false })
                        textEvent.onComplete && textEvent.onComplete();    
                    }, textEvent.duration);
                })
            }
            else{
                console.error("Narration event was incorrectly specified: no duration or interaction requirement provided")
            }
        }

    }, [textEvent])



 
    return (
        <>
            <NarratorComponent 
                visible={narratorText.visible} 
                text={narratorText.text} 
                requiresInteraction={narratorText.requiresInteraction}
                darkeningVisible={narratorText.darkeningVisible}
                darkeningDuration={narratorText.darkeningDuration}
                onComplete={narratorText.onComplete}
                />
            <SystemComponent 
                visible={systemText.visible} 
                text={systemText.text} 
                requiresInteraction={systemText.requiresInteraction}
                onComplete={systemText.onComplete}
                />
        </>
    );
}