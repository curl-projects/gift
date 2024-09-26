
import { useState, useEffect, useCallback, useRef } from "react"
import { useStarFireSync } from "~/components/synchronization/StarFireSync"
import { useConstellationMode } from "~/components/canvas/custom-ui/utilities/ConstellationModeContext"
import NarratorComponent from "~/components/canvas/custom-ui/game-ui/Narrator/components/NarratorComponent.jsx"
import SystemComponent from "~/components/canvas/custom-ui/game-ui/Narrator/components/SystemComponent.jsx"

export function NarrationPainter(){
    const { textEvent, setTextEvent, gameSystemText, gameNarratorText, 
            setGameSystemText, setGameNarratorText, narratorText, systemText, 
            setNarratorText, setSystemText, narratorEvent } = useStarFireSync();
    
    const handleKeyDownRef = useRef();
    const [nextButtonVisible, setNextButtonVisible] = useState(false);

    const handleKeyDown = useCallback((event) => {
        if (event.key === ' ') {
            console.log('triggering listener!')
            setNextButtonVisible(false);
            window.removeEventListener('keydown', handleKeyDownRef.current);
            event.preventDefault();
            textEvent.onComplete && textEvent.onComplete();
        }
    }, [textEvent]);

    useEffect(() => {
        handleKeyDownRef.current = handleKeyDown;
    }, [handleKeyDown]);

    // todo: this is terrible logic, fix later
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
                console.log("text event is not visible:", textEvent)
                setState({ visible: false, textf: "", requiresInteraction: false })
                // todo: this should be promise chained, but i can't figure out why it's not resolving
                // .then(()=>{
                    console.log("text event complete")
                    textEvent.onComplete && textEvent.onComplete();
                // })
            }

            else if(textEvent.requiresInteraction){
                // trigger state change
                console.log("TEXT EVENT REQUIRES INTERACTION")

                if(textEvent.waitUntilVisible){
                    setState({ visible: true, text: textEvent.text, requiresInteraction: textEvent.requiresInteraction, 
                            darkeningVisible: textEvent.darkeningVisible, darkeningDuration: textEvent.darkeningDuration, delay: textEvent.delay,
                            headerText: textEvent.headerText, textAlign: textEvent.textAlign }).then(()=>{
                        console.log("adding listener once visible")
                        // setState(prevState => ({ ...prevState, nextButtonVisible: true }))
                        window.addEventListener('keydown', handleKeyDownRef.current);
                    })
                }
                else{
                    setState({ visible: true, text: textEvent.text, requiresInteraction: textEvent.requiresInteraction, 
                        darkeningVisible: textEvent.darkeningVisible, darkeningDuration: textEvent.darkeningDuration, delay: textEvent.delay, 
                        headerText: textEvent.headerText, textAlign: textEvent.textAlign })
                    console.log("adding listener immediately")
                    window.addEventListener('keydown', handleKeyDownRef.current);
                }
            }
            else if(textEvent.duration){
                // trigger state change
                Promise.all([
                    // setOtherState({ visible: false, text: '', requiresInteraction: false }),
                    setState({ visible: true, text: textEvent.text, requiresInteraction: textEvent.requiresInteraction, 
                                darkeningVisible: textEvent.darkeningVisible, darkeningDuration: textEvent.darkeningDuration, delay: textEvent.delay, 
                                headerText: textEvent.headerText, textAlign: textEvent.textAlign })
                ]).then(()=>{
                    // once the animation has resolved, resolve the text event
                    setTimeout(() => {
                        setState({ visible: false, text: "", requiresInteraction: false })
                        textEvent.onComplete && textEvent.onComplete();    
                    }, textEvent.duration);
                })
            }
            else if(textEvent.waitCondition){
                // set the state

                if(textEvent.waitUntilVisible){
                    console.log("wait until visible")
                    setState({ visible: true, text: textEvent.text, requiresInteraction: textEvent.requiresInteraction, 
                        darkeningVisible: textEvent.darkeningVisible, darkeningDuration: textEvent.darkeningDuration, delay: textEvent.delay, 
                        headerText: textEvent.headerText, textAlign: textEvent.textAlign }).then(()=>{
                            console.log("wait condition activated")
                            textEvent.waitCondition().then(()=>{
                                console.log('waiting')
                                textEvent.onComplete && textEvent.onComplete();
                            })
                        })    
                }
                else{
                    setState({ visible: true, text: textEvent.text, requiresInteraction: textEvent.requiresInteraction, 
                        darkeningVisible: textEvent.darkeningVisible, darkeningDuration: textEvent.darkeningDuration, delay: textEvent.delay, 
                        headerText: textEvent.headerText, textAlign: textEvent.textAlign })
                    
                         // resolve when the wait condition is met
                        textEvent.waitCondition().then(()=>{
                                console.log('waiting')
                        textEvent.onComplete && textEvent.onComplete();
                    })
                }
              
               

            }
            else{
                console.error("Narration event was incorrectly specified: no duration or interaction requirement provided")
            }
        }

    }, [textEvent])

    useEffect(() => {
        return () => {
            window.removeEventListener('keydown', handleKeyDownRef.current);
        };
    }, [narratorEvent]);

 
    return (
        <>
            <NarratorComponent 
                visible={narratorText.visible} 
                text={narratorText.text} 
                requiresInteraction={narratorText.requiresInteraction}
                darkeningVisible={narratorText.darkeningVisible}
                darkeningDuration={narratorText.darkeningDuration}
                onComplete={narratorText.onComplete}
                delay={narratorText.delay}
                nextButtonVisible={nextButtonVisible}
                setNextButtonVisible={setNextButtonVisible}
                />
            <SystemComponent 
                visible={systemText.visible} 
                text={systemText.text}  
                headerText={systemText.headerText}
                requiresInteraction={systemText.requiresInteraction}
                onComplete={systemText.onComplete}
                delay={systemText.delay}
                textAlign={systemText.textAlign}
                nextButtonVisible={nextButtonVisible}
                setNextButtonVisible={setNextButtonVisible}
                />
        </>
    );
}