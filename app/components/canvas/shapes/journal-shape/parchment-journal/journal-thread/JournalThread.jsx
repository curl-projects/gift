import { motion } from 'framer-motion';
import styles from './JournalThread.module.css'
import { useEffect } from 'react';

export function JournalThread({ d, duration = 1, delay = 0, strokeWidth = 4, pageContainer = false, onOpaque, persist = false, opacity = 1, shouldAnimate = false }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            if (onOpaque) {
                onOpaque();
            }
        }, (delay + duration) * 1000); // Convert duration to milliseconds

        return () => clearTimeout(timer); // Cleanup the timer on unmount
    }, []);

    return (
        <>
            <motion.path
                className={pageContainer ? styles.pageLine : styles.pathLine}
                d={d}
                fill="transparent"
                stroke="white"
                strokeWidth={strokeWidth}
                strokeLinecap="square"
                initial={{ pathLength: shouldAnimate ? 0 : 1, opacity: 0 }}
                animate={{ 
                    pathLength: shouldAnimate ? [0, 0, 1, 1] : [1, 1, 1, 1],
                    opacity: persist ? [0, opacity, opacity, opacity] : [0, opacity, opacity, 0]
                }}
                transition={{ 
                    duration: duration + 1, // Add 1 second for fading
                    delay,
                    times: [0, 0.01, duration / (duration + 1), 1], // Normalize animation keyframes
                    ease: ["easeInOut", "easeInOut", "easeInOut"]
                }}
            />
        </>
    )
}