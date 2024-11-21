import styles from './Star.module.css';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useStarFireSync } from '~/components/synchronization/StarFireSync';
import { useState } from 'react';
import { englishToLepchaMap } from '~/components/canvas/helpers/language-funcs';

export function NewStar({ person, isActive }) {
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();
    const { setTriggerWarp, setConstellationLabel, minimapMode } = useStarFireSync();

    const expanded = minimapMode.expanded || minimapMode.hovered;

    return (
        <div
            className={`${styles.newStar} ${isActive ? styles.activeStarContainer : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => {
                navigate(`/pitch-deck/${person.uniqueName}`, { replace: false });
                setTriggerWarp({
                    active: true,
                    accDuration: 1000,
                    deaccDuration: 2000,
                    constAccDuration: 1000
                }).then(() => {
                    setConstellationLabel({
                        visible: true,
                        immediate: false,
                        duration: 2,
                        delay: 0,
                        text: person.name
                    });
                });
            }}
        >
            {expanded && (
                <motion.div
                    className={styles.hoverDescription}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: "linear" }}
                >
                    <p>{person.name}</p>
                </motion.div>
            )}
            <motion.p
                className={styles.newStarText}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "linear", delay: 0.5 }}
            >
                {englishToLepchaMap[person.name[0]]}
            </motion.p>
        </div>
    );
}