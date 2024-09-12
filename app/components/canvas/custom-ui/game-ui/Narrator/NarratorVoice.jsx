import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./NarratorVoice.module.css";
import { useConstellationMode } from "~/components/canvas/custom-ui/utilities/ConstellationModeContext";
import { useEditor, createShapeId } from "tldraw";

import NarratorComponent from "./components/NarratorComponent";
import SystemComponent from "./components/SystemComponent";

export function NarratorVoice() {
    const editor = useEditor();
    const { narratorEvent, setNarratorEvent, setDrifting } = useConstellationMode();
    const [narratorState, setNarratorState] = useState({ visible: false, text: '', requiresInteraction: false });
    const [systemState, setSystemState] = useState({ visible: false, text: '', requiresInteraction: false });
    const [commands, setCommands] = useState([]);

    // useEffect(() => {
    //     setNarratorEvent('welcome');
    // }, [setNarratorEvent]);

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
            command.callback();
            executeCommands(commands, index + 1);
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