import { motion } from 'framer-motion';
import styles from './JournalThread.module.css'
import { useEffect } from 'react';

export function JournalThread({ d, duration = 1, delay = 0, strokeWidth = 4, pageContainer = false }) {
    return (
        <>
            <motion.path
                className={pageContainer ? styles.pageLine : styles.pathLine}
                d={d}
                fill="transparent"
                stroke="white"
                strokeWidth={strokeWidth}
                strokeLinecap="square"
                initial={{ pathLength: 0, opacity: 1 }}
                animate={{ 
                    pathLength: [0, 1, 1],
                    opacity: [1, 1, 1]
                }}
                transition={{ 
                    duration: duration + 1, // Add 1 second for fading
                    delay,
                    times: [0, duration / (duration + 1), 1], // Normalize animation keyframes
                    ease: ["easeInOut", "easeInOut", "easeInOut"]
                }}
            />
        </>
    )
}