import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./NarratorVoice.module.css";
import { useConstellationMode } from "~/components/canvas/custom-ui/utilities/ConstellationModeContext";
import { useEditor, createShapeId } from "tldraw";
import { useStarFireSync } from "~/components/synchronization/StarFireSync";
import NarratorComponent from "./components/NarratorComponent";
import SystemComponent from "./components/SystemComponent";

export function NarratorVoice() {
    const editor = useEditor();
    const { narratorEvent, setNarratorEvent, 
        setDrifting, overlayMode, setOverlayMode, 
       
        expandConstellation, setExpandConstellation,
    } = useConstellationMode();


    const { 
        campfireView,
        setCampfireView,
        cloudControls, setCloudControls,
        starControls, setStarControls,
        overlayControls, setOverlayControls,
        trueOverlayControls, setTrueOverlayControls,
        commandEvent, setCommandEvent,
        gameSystemText, setGameSystemText,
        gameNarratorText, setGameNarratorText,
        triggerWarp, setTriggerWarp,
        journalMode, setJournalMode,
        triggerEffect,
        textEvent, setTextEvent,
        constellationLabel, setConstellationLabel,
        glyphControls, setGlyphControls,
        animationEvent, setAnimationEvent,
    } = useStarFireSync();

    const [narratorState, setNarratorState] = useState({ visible: false, text: '', requiresInteraction: false });
    const [systemState, setSystemState] = useState({ visible: false, text: '', requiresInteraction: false });
    // const [commands, setCommands] = useState([]);

    useEffect(() => {
        setNarratorEvent('pitch');
    }, [setNarratorEvent]);

    const narratorOrchestration = {
        'pitch': [
            // setup -- it's a dark night with a faded sky
            // {
            //     type: 'callback',
            //     callback: () => {
            //         setConstellationLabel({ visible: false, immediate: true })
            //         setCampfireView({ active: false, immediate: true })
            //         setOverlayControls({ dark: true, immediate: true })
            //         setStarControls({ visible: false, immediate: true })
            //         setCloudControls({ visible: true, immediate: true })
            //     }
            // },
            // {
            //     // hardcoded jank because the promise logic isn't working for the components above
            //     type: 'callback',
            //     callback: () => {
            //         return new Promise(resolve => setTimeout(resolve, 2000));
            //     },
            //     waitForCallback: true,
            // },     
            // {
            //     type: 'callback',
            //     callback: () => {
            //         return Promise.all([
            //             setTextEvent({ 
            //                 type: 'narrator',
            //                 visible: true,
            //                 overlay: false,
            //                 text: "This can be a cold and desolate place.", 
            //                 requiresInteraction: true, 
            //                 darkeningVisible: false, 
            //             })
            //         ])
            //     },
            //     waitForCallback: true,
            // }, 
            // {
            //     type: 'callback',
            //     callback: () => {
            //         return Promise.all([
            //             setTextEvent({ 
            //                 type: 'narrator',
            //                 visible: true,
            //                 overlay: false,
            //                 text: "We have spent much of our lives here, lost in a stupor, adrift in a void,", 
            //                 requiresInteraction: true, 
            //                 darkeningVisible: false
            //             })
            //         ])
            //     },
            //     waitForCallback: true,
            // }, 
            // {
            //     type: 'callback',
            //     callback: () => {
            //         return Promise.all([
            //             setTextEvent({ 
            //                 type: 'narrator',
            //                 visible: true,
            //                 overlay: false,
            //                 text: "flitting between cold ideas.", 
            //                 requiresInteraction: true, 
            //                 darkeningVisible: false, 
            //             })
            //         ])
            //     },
            //     waitForCallback: true,
            // }, 
            // {
            //     type: 'callback',
            //     callback: () => {
            //         setStarControls({ visible: true, immediate: false, duration: 4 })
            //     }
            // },
            // {
            //     type: 'callback',
            //     callback: () => {
            //         return Promise.all([
            //             setTextEvent({ 
            //                 type: 'narrator',
            //                 visible: true,
            //                 overlay: false,

            //                 text: "Now that you have returned to me, I wish to try building something better.", 
            //                 requiresInteraction: true, 
            //                 darkeningVisible: true,
            //                 darkeningDuration: 2, 
            //             })
            //         ])
            //     },
            //     waitForCallback: true,
            // }, 
            // {
            //     type: 'callback',
            //     callback: () => {
            //         return Promise.all([
            //             setTextEvent({ 
            //                 type: 'narrator',
            //                 visible: true,
            //                 overlay: false,
            //                 text: "It has been so very long since you were \n awake", 
            //                 requiresInteraction: true, 
            //                 waitUntilVisible: false,
            //                 darkeningVisible: true, 
            //             })
            //         ])
            //     },
            //     waitForCallback: true,
            // },
            // {
            //     type: 'callback',
            //     callback: () => {
            //         console.log('fade narrator event')
            //         return Promise.all([
            //             setTextEvent({ 
            //                 type: 'narrator',
            //                 overlay: false,
            //                 visible: false,
                            
                           
            //             })
            //         ])
            //     },
            //     waitForCallback: true,
            // },
            // {
            //     type: 'callback',
            //     callback: () => {
            //         return Promise.all([
            //             setTrueOverlayControls({ visible: true, immediate: false, duration: 4 }),
            //         ])
            //     },
            //     waitForCallback: true,
            // },
            // {
            //     type: 'callback',
            //     callback: () => {
            //         return Promise.all([
            //             setCampfireView({ active: true, immediate: true, targetMeshName: 'constellationCanvas' }),
            //             setStarControls({ visible: true, immediate: true })
                        
            //         ])
            //     },
            //     waitForCallback: true,
            // },
            // {
            //     type: 'callback',
            //     callback: () => {
            //         return Promise.all([
            //             setTrueOverlayControls({ visible: false, immediate: false, duration: 4 }),
            //             setOverlayControls({ dark: false, immediate: false, duration: 4, delay: 2 }),
            //         ])
            //     },
            //     waitForCallback: true,
            // },
            // {
            //     type: 'callback',
            //     callback: () => {
            //         return Promise.all([
                        
            //             setTextEvent({ 
            //                 type: 'system',
            //                 visible: true,
            //                 overlay: true,
            //                 text: "Try moving around", 
            //                 waitUntilVisible: true,
            //                 darkeningVisible: true, 
            //                 waitCondition: () => {
            //                     return Promise.all([
            //                         setCommandEvent({
            //                              eventType: 'camera-moved',
            //                             props: {}
            //                         })
            //                     ])
            //                 }
            //             })
            //         ])
            //     },
            //     waitForCallback: true,
            // }, 
            // {
            //     type: 'callback',
            //     callback: () => {
            //         console.log('triggered')
            //         return Promise.all([
            //             setTextEvent({ 
            //                 type: 'system',
            //                 overlay: true,
            //                 visible: false,
                            
                           
            //             })
            //         ])
            //     },
            //     waitForCallback: false,
            // },
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setCommandEvent({
                            eventType: 'mesh-visible', 
                            props: {
                                meshName: 'narrator'
                            }
                            })
                    ])
                },
                waitForCallback: true,
            },
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setAnimationEvent({ 
                            animationGroupName: 'looking-down',
                            props: {
                                reverse: true,
                                startFrame: 300,  
                                endFrame: 10,          
                            }
                        }),
                        setTextEvent({ 
                            type: 'narrator',
                            visible: true,
                            overlay: true,
                            text: "So long spent in the dark sky - do you even remember what the stars look like?", 
                            duration: 3,
                            requiresInteraction: true,
                            waitUntilVisible: true,
                            darkeningVisible: true, 
                        })
                    ])
                },
                waitForCallback: true,
            }, 
            // {
            //     type: 'callback',
            //     callback: () => {
            //         return Promise.all([
            //             setCampfireView({ active: false, immediate: false }),
            //             setTextEvent({ 
            //                 type: 'narrator',
            //                 visible: false,
            //                 overlay: true,
            //             })
            //         ])
            //     },
            //     waitForCallback: true,
            // }, 
            // {
            //     type: 'callback',
            //     callback: () => {
            //         return Promise.all([
                        
            //             setConstellationLabel({ 
            //                 visible: true, 
            //                 immediate: false, 
            //                 duration: 2, 
            //                 delay: 2,
            //                 text: "The First Star"
            //             }),
                        
            //         ])
            //     },
            //     waitForCallback: true,
            // },
            // {
            //     type: 'callback',
            //     callback: () => {
            //         return Promise.all([
            //             setExpandConstellation({ concepts: true, excerpts: true }),
            //             setTextEvent({ 
            //                 type: 'system',
            //                 visible: true,
            //                 overlay: false,
            //                 text: "create constellations to explore your work", 
            //                 requiresInteraction: true, 
            //                 delay: 2,
            //             }),
            //         ])
            //     },
            //     waitForCallback: true,
            // },
            // {
            //     type: 'callback',
            //     callback: () => {
            //         return Promise.all([
            //             setTriggerWarp({ active: true, accDuration: 1000, deaccDuration: 1000, constAccDuration: 1000 }).then(()=>{
            //                 setConstellationLabel({ 
            //                     visible: true, 
            //                     immediate: false, 
            //                     duration: 2, 
            //                     delay: 2,
            //                     text: "Finn's Cluster"
            //                 })
            //             }),
            //             setTextEvent({ 
            //                 type: 'system',
            //                 visible: true,
            //                 overlay: false,
            //                 text: "traverse the stars to discover new ideas", 
            //                 requiresInteraction: true, 
            //                 delay: 2,
            //             })
            //         ])
            //     },
            //     waitForCallback: true,
            // },
            // {
            //     type: 'callback',
            //     callback: () => {
            //         return Promise.all([
            //             setTextEvent({ 
            //                 type: 'system',
            //                 visible: true,
            //                 overlay: false,
            //                 text: "collect glyphs to forge new friendships", 
            //                 requiresInteraction: true, 
            //                 delay: 2
            //             }),
            //             setGlyphControls({ visible: true, immediate: false, duration: 4 })
            //         ])
            //     },
            //     waitForCallback: true,
            // },
            // {
            //     type: 'callback',
            //     callback: () => {
            //         return Promise.all([
            //             setGlyphControls({ visible: false, immediate: false, duration: 4 }),
            //             setTextEvent({ 
            //                 type: 'system',
            //                 visible: false,
            //                 overlay: false,
            //             }),
            //             setJournalMode({ active: true, page: 'cover' })

            //         ])
            //     },
            //     waitForCallback: true,
            // },
            // {
            //     type: 'callback',
            //     callback: () => {
            //         return Promise.all([
            //             setCampfireView({ active: false, immediate: false })
            //         ])
            //     },
            //     waitForCallback: true,
            // },
        ],
        'welcome': [
            {
                "type": "narrator",
                'text': 'Welcome',
                'duration': 3000,
                'requiresInteraction': true,
            },
            {
                'type': "narrator",
                'text': 'This place is a simple simulation',
                'duration': 3000,
                'requiresInteraction': true,
            },
            {
                'type': "system",
                'text': 'an echo of something far greater',
                'duration': 3000,
                'requiresInteraction': true,
            },
            {
                'type': "system",
                'text': 'i hope you enjoy it',
                'duration': 3000,
                'requiresInteraction': true,
            },
            // {   
            //     'type': 'callback',
            //     'callback': () => setDrifting(true)
            // },
        ],
        'leaveAnnotation': [
            {
                'text': 'You must offer up something in return',
                'duration': 3000,
                'waitForCondition': useCallback(() => {
                    return editor.getOnlySelectedShape()?.id !== createShapeId("temp-annotation")
                }, [editor])
            }
        ]
    };


    const executeCommands = useCallback((commands, index) => {
        // const handleKeyDown = (event, setState) => {
        //     console.log("HANDLING KEYDOWN")
        //     console.log("EVENT!", event)
        //     if (event.key === ' ') {
        //         window.removeEventListener('keydown', handleKeyDown);
        //         event.preventDefault();

        //         if(commands[index].waitForCompletion) {
        //             setState({ visible: false, text: "", requiresInteraction: false })
        //             setTimeout(() => {
        //                 executeCommands(commands, index + 1);
        //             }, commands[index].exitDuration || 2000) // currently hard-coded, but can change this
        //         } else {
        //             executeCommands(commands, index + 1);
        //         }  
        //     }
        // };

        // if (index >= commands.length) {
        //     setNarratorState({ visible: false, text: '', requiresInteraction: false });
        //     setSystemState({ visible: false, text: '', requiresInteraction: false });
        //     setGameNarratorText({ visible: false, text: '', requiresInteraction: false });
        //     setGameSystemText({ visible: false, text: '', requiresInteraction: false });
        //     setNarratorEvent(null);
        //     return;
        // }

        if(index >= commands.length){
            return;
        }

        const command = commands[index];

        // if (command.type === "system" || command.type === "narrator") {
        //     // to do: fix this, not generalizable to many actors
        //     const setState = command.type === "system" 
        //         ? (command.overlay ? setGameSystemText : setSystemState) 
        //         : (command.overlay ? setGameNarratorText : setNarratorState);

        //     const setOtherState = command.type === "system" 
        //         ? (command.overlay ? setGameNarratorText : setNarratorState) 
        //         : (command.overlay ? setGameSystemText : setSystemState);

        //     setOtherState({ visible: false, text: '', requiresInteraction: false });
        //     setState({ visible: true, text: command.text, requiresInteraction: command.requiresInteraction, 
        //                 darkeningVisible: command.darkeningVisible, 
        //                 darkeningDuration: command.darkeningDuration });

        //     if (command.requiresInteraction) {
        //         window.addEventListener('keydown', (event) => handleKeyDown(event, setState));
            
        //     } else if (command.waitForCondition) {
        //         const checkCondition = () => {
        //             if (command.waitForCondition()) {
        //                 setState({ visible: false, text: '', requiresInteraction: false });
        //                 setTimeout(() => {
        //                     executeCommands(commands, index + 1);
        //                 }, command.waitConditionTime || 1000);
        //             } else {
        //                 setTimeout(checkCondition, 200);
        //             }
        //         };
        //         checkCondition();
        //     } else if (command.duration) {
        //         setTimeout(() => {
        //             setState({ visible: false, text: '', requiresInteraction: false });
        //             executeCommands(commands, index + 1);
        //         }, command.duration);
        //     } else {
        //         console.error("Command was incorrectly specified: no interaction, wait condition or duration provided");
        //     }
        // }

        console.log("COMMANDS", commands)
        console.log("COMMAND", command)
        console.log("COMMAND INDEX:", index)
    
        if (command.type === "callback") {
            setNarratorState({ visible: false, text: '', requiresInteraction: false });
            setSystemState({ visible: false, text: '', requiresInteraction: false });
            setGameNarratorText({ visible: false, text: '', requiresInteraction: false });
            setGameSystemText({ visible: false, text: '', requiresInteraction: false });


            if(false && command.waitForCondition){
                const checkCondition = () => {
                    if (command.waitForCondition()) {
                        if(command.waitForCallback){
                            command.callback().then(() => {
                                executeCommands(commands, index + 1);
                            });
                        } else {
                            executeCommands(commands, index + 1);
                        }
                    } else {
                        setTimeout(checkCondition, 200);
                    }
                };
                checkCondition();
            }
            else {
                if (command.waitForCallback) {
                    command.callback().then(() => {
                        console.log('executing next command')
                        executeCommands(commands, index + 1);
                    });
                } else {
                    command.callback()
                    executeCommands(commands, index + 1);
                }
            } 
            }
            else {
                console.error("Unknown command type:", command.type);
            }   
    }, []);

    useEffect(() => {
        if (narratorEvent && narratorOrchestration[narratorEvent]) {
            // setCommands(narratorOrchestration[narratorEvent]);
            executeCommands(narratorOrchestration[narratorEvent], 0);
        }
    }, [narratorEvent]);

    return (
        <>
            <NarratorComponent 
                visible={narratorState.visible} 
                text={narratorState.text} 
                requiresInteraction={narratorState.requiresInteraction}
                exitDuration={narratorState.exitDuration}
                darkeningVisible={narratorState.darkeningVisible}
                darkeningDuration={narratorState.darkeningDuration}
                />
            <SystemComponent 
                visible={systemState.visible} 
                text={systemState.text} 
                requiresInteraction={systemState.requiresInteraction}
                onComplete={systemState.onComplete}
                />
        </>
    );
}