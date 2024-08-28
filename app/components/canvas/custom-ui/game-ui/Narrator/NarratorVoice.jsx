import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./NarratorVoice.module.css";
import { useConstellationMode } from "~/components/canvas/custom-ui/utilities/ConstellationModeContext";

export function NarratorVoice() {
    const { narratorEvent, setNarratorEvent } = useConstellationMode();
    const [visible, setVisible] = useState(false);
    const [currentText, setCurrentText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [commands, setCommands] = useState([]);
    const [timeoutId, setTimeoutId] = useState(null);
    const [position, setPosition] = useState('bottom');

    useEffect(() => {
        setNarratorEvent('welcome');
    }, [setNarratorEvent]);

    const narratorOrchestration = {
        'welcome': [
            {
                'text': 'Welcome',
                'duration': 3000,
                'requiresInteraction': true,
                'position': 'three-quarters'
            },
            {
                'text': 'This place is a simple simulation',
                'duration': 3000,
                'requiresInteraction': true,
                'position': 'three-quarters'
            }
        ],
        'leaveAnnotation': [
            {
                'text': 'You must offer up something in return',
                'duration': 1000,
                'requiresInteraction': false,
                'position': 'bottom'
            }
        ]
    };

    useEffect(() => {
        if (narratorEvent && narratorOrchestration[narratorEvent]) {
            setCommands(narratorOrchestration[narratorEvent]);
            setCurrentIndex(0);
            executeCommands(narratorOrchestration[narratorEvent], 0);
        }
    }, [narratorEvent]);

    const executeCommands = useCallback((commands, index) => {
        if (index >= commands.length) {
            setVisible(false);
            return;
        }

        const command = commands[index];
        setCurrentText(command.text);
        setPosition(command.position);
        setVisible(true);

        if (!command.requiresInteraction) {
            const id = setTimeout(() => {
                setVisible(false);
                setTimeout(() => {
                    executeCommands(commands, index + 1);
                }, 3000); // Fade out duration
            }, command.duration);
            setTimeoutId(id);
        }
    }, []);

    const handleKeyDown = useCallback((event) => {
        if (event.key === ' ') {
            event.preventDefault();
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            setVisible(false);
            setTimeout(() => {
                executeCommands(commands, currentIndex + 1);
                setCurrentIndex((prevIndex) => prevIndex + 1);
            }, 3000); // Fade out duration
        }
    }, [commands, currentIndex, executeCommands, timeoutId]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    className={`${styles.voiceContainer} ${styles[position]}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 3 }}
                >
                    <div className={styles.voiceContainerInner}>
                        <p className={styles.voiceText}>{currentText}</p>
                        <div className={`${styles.voiceContainerDarkening} ${position === 'three-quarters' ? styles.threeQuartersDarkening : ''}`} />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}