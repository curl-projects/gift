import styles from './JournalEntry.module.css'
import { JournalThread } from '~/components/canvas/shapes/journal-shape/parchment-journal/journal-thread/JournalThread.jsx'
import { motion } from 'framer-motion'
import { useRef, useEffect, useState } from 'react';

export function JournalEntry({ type, entry }){
    const specimenRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (specimenRef.current) {
            const { offsetWidth, offsetHeight } = specimenRef.current;
            setDimensions({ width: offsetWidth, height: offsetHeight });
        }
    }, []);

    return <div className={styles.journalEntry}>
        <div className={styles.entrySpecimenOuter}>
            <div className={styles.entrySpecimen} ref={specimenRef}>
                {/* {type === 'concept' &&
                } */}
                    <motion.svg className={styles.animatedContainer}>
                        <JournalThread
                    d={`M 0 0 L ${dimensions.width} 0 L ${dimensions.width} ${dimensions.height} L 0 ${dimensions.height} Z`} 
                    delay={0}
                    duration={1}
                    strokeWidth={1}
                    persist
                    />
            </motion.svg>
            </div>
        </div>
        <div className={styles.entryContent}>
            <div className={styles.entryTitle}>
                {entry.title}
            </div>
            <div className={styles.entryText}>
                {entry.content}
            </div>
        </div>
    </div>
}