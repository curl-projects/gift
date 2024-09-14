import { useState, useEffect } from "react"
import { useStarFireSync } from "~/components/synchronization/StarFireSync"
import { useConstellationMode } from "~/components/canvas/custom-ui/utilities/ConstellationModeContext"
import NarratorComponent from "~/components/canvas/custom-ui/game-ui/Narrator/components/NarratorComponent.jsx"
import SystemComponent from "~/components/canvas/custom-ui/game-ui/Narrator/components/SystemComponent.jsx"

export function NarrationPainter(){
    const { textEvent, setTextEvent, gameSystemText, gameNarratorText, setGameSystemText, setGameNarratorText } = useStarFireSync();
    const [narratorText, setNarratorText] = useState({ visible: false, text: '', requiresInteraction: false });
    const [systemText, setSystemText] = useState({ visible: false, text: '', requiresInteraction: false });

    const handleKeyDown = (event, setState) => {
        console.log("HANDLING KEYDOWN")
        if (event.key === ' ') {
            window.removeEventListener('keydown', handleKeyDown);
            event.preventDefault();

            if(textEvent.waitForCompletion) {
                setState({ visible: false, text: "", requiresInteraction: false })
                setTimeout(() => {
                    textEvent.onComplete && textEvent.onComplete();
                }, textEvent.exitDuration || 2000) // currently hard-coded, but can change this
            } else {
                setState({ visible: false, text: "", requiresInteraction: false })
                textEvent.onComplete && textEvent.onComplete();
            }  
        }
    };

    useEffect(()=>{
        if(textEvent){

            // determine what state to work with
            const setState = textEvent.type === "system" 
                ? (textEvent.overlay ? setGameSystemText : setSystemText) 
                : (textEvent.overlay ? setGameNarratorText : setNarratorText);

            const setOtherState = textEvent.type === "system" 
                ? (textEvent.overlay ? setGameNarratorText : setNarratorText) 
                : (textEvent.overlay ? setGameSystemText : setSystemText);

            if(textEvent.requiresInteraction){
                // trigger state change
                Promise.all([
                    setOtherState({ visible: false, text: '', requiresInteraction: false }),
                    setState({ visible: true, text: textEvent.text, requiresInteraction: textEvent.requiresInteraction, 
                                darkeningVisible: textEvent.darkeningVisible, darkeningDuration: textEvent.darkeningDuration })
                ]).then(()=>{
                    // once the animation has resolved, resolve the text event
                    window.addEventListener('keydown', (event) => handleKeyDown(event, setState));
                })

                // attach event handler

                // resolve the text event when the event is triggered

            }
            else if(textEvent.duration){
                // trigger state change
                Promise.all([
                    setOtherState({ visible: false, text: '', requiresInteraction: false }),
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
                exitDuration={narratorText.exitDuration}
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