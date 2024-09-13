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
        setStarsVisible, setCloudsVisible,
        starControls, setStarControls, 
        cloudControls, setCloudControls,
        overlayControls, setOverlayControls,
    } = useConstellationMode();


    const { 
        campfireView,
        setCampfireView,
    } = useStarFireSync();

    const [narratorState, setNarratorState] = useState({ visible: false, text: '', requiresInteraction: false });
    const [systemState, setSystemState] = useState({ visible: false, text: '', requiresInteraction: false });
    const [commands, setCommands] = useState([]);

    useEffect(() => {
        setNarratorEvent('pitch');
    }, [setNarratorEvent]);

    const narratorOrchestration = {
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
        'pitch': [
            {
                type: "callback",
                callback: () => {
                    // it's a dark and stormy night
                    setCampfireView({ active: false, immediate: true })
                    setOverlayControls({ dark: true, immediate: true })
                    setStarControls({ visible: true, immediate: true })
                    setCloudControls({ visible: true, immediate: true })
                }
            },
            {
                type: "narrator",
                text: "This can be a cold and desolate place.",
                duration: 3000,
                requiresInteraction: true
            },
            {
                type: 'callback',
                callback: () => {
                    // the stars slowly fade to black
                    return Promise.all([
                        setStarControls({ visible: false, immediate: false }),
                        setCloudControls({ visible: false, immediate: false})
                    ])
                },
                waitForCallback: true
            },
            {
                type: "callback",
                callback: () => {
                    // the campfire fades into view
                    setCampfireView({ active: true, immediate: false })
                }
            },
            // {
            //     type: "narrator",
            //     text: "I have spent much of my life here, and I can count on one hand the number of friends that I have made.",
            //     duration: 3000,
            //     requiresInteraction: true
            // },
            // {
            //     type: "narrator",
            //     text: "Much of that time I have spent in a stupor, adrift in a void,",
            //     duration: 3000,
            //     requiresInteraction: true
            // },
            // {
            //     type: "narrator",
            //     text: "flitting between cold ideas.",
            //     duration: 3000,
            //     requiresInteraction: true
            // },
            // {
            //     type: 'callback',
            //     callback: () => setStarControls({ visible: true, immediate: false})
            // },
            // {
            //     type: "narrator",
            //     text: "I want to try building something better.",
            //     duration: 3000,
            //     requiresInteraction: true,
            // },
            
            // { // transition from constellation to campfire
            //     type: 'callback',
            //     callbackBack: () => {
            //         setStarControls({ visible: false, immediate: false})
            //         setCloudControls({ visible: false, immediate: false})
            //     }

            // }
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
        const handleKeyDown = (event) => {
            if (event.key === ' ') {
                event.preventDefault();
                executeCommands(commands, index + 1);
                window.removeEventListener('keydown', handleKeyDown);
            }
        };

        if (index >= commands.length) {
            setNarratorState({ visible: false, text: '', requiresInteraction: false });
            setSystemState({ visible: false, text: '', requiresInteraction: false });
            setNarratorEvent(null);
            return;
        }

        const command = commands[index];

        if (command.type === "system" || command.type === "narrator") {

            // to do: fix this, not generalizable to many actors
            const setState = command.type === "system" ? setSystemState : setNarratorState;
            const setOtherState = command.type === "system" ? setNarratorState : setSystemState;

            setOtherState({ visible: false, text: '', requiresInteraction: false });
            setState({ visible: true, text: command.text, requiresInteraction: command.requiresInteraction });

            if (command.requiresInteraction) {
                window.addEventListener('keydown', handleKeyDown);
            } else if (command.waitForCondition) {
                const checkCondition = () => {
                    if (command.waitForCondition()) {
                        setState({ visible: false, text: '', requiresInteraction: false });
                        setTimeout(() => {
                            executeCommands(commands, index + 1);
                        }, command.waitConditionTime || 1000);
                    } else {
                        setTimeout(checkCondition, 200);
                    }
                };
                checkCondition();
            } else if (command.duration) {
                setTimeout(() => {
                    setState({ visible: false, text: '', requiresInteraction: false });
                    executeCommands(commands, index + 1);
                }, command.duration);
            } else {
                console.error("Command was incorrectly specified: no interaction, wait condition or duration provided");
            }
        } else if (command.type === "callback") {
            if (command.waitForCallback) {
            // check if the callback is a promise; otherwise throw an error, because we need it to resolve
                command.callback().then(() => {
                    executeCommands(commands, index + 1);
                });
            } else {
                command.callback()
                executeCommands(commands, index + 1);
            }
        } else {
            console.error("Unknown command type:", command.type);
        }
    }, []);

    useEffect(() => {
        if (narratorEvent && narratorOrchestration[narratorEvent]) {
            setCommands(narratorOrchestration[narratorEvent]);
            executeCommands(narratorOrchestration[narratorEvent], 0);
        }
    }, [narratorEvent]);

    return (
        <>
            <NarratorComponent visible={narratorState.visible} text={narratorState.text} requiresInteraction={narratorState.requiresInteraction} />
            <SystemComponent visible={systemState.visible} text={systemState.text} requiresInteraction={systemState.requiresInteraction} />
        </>
    );
}