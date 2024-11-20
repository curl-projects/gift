import styles from "./MinimapPainter.module.css"
import { motion } from "framer-motion"
import { JournalThread } from '~/components/canvas/shapes/journal-shape/parchment-journal/journal-thread/JournalThread';
import { FaJournalWhills } from "react-icons/fa";
import { useRef, useEffect } from 'react';
import { useStarFireSync } from '~/components/synchronization/StarFireSync';

export function MinimapDrag({ minimapRef }) {
    const { conceptIsDragging, setConceptIsDragging, minimapMode } = useStarFireSync()
    const draggingContainerRef = useRef(null);

    return (
        <motion.div
            ref={draggingContainerRef}
            className={styles.draggingContainer}
            initial={{
                boxShadow: '0 0 0 rgba(255, 255, 255, 0)'
            }}
            animate={{
                boxShadow: [
                    '0 0 0 rgba(255, 255, 255, 0)',
                    '0 0 20px rgba(255, 255, 255, 0.8)',
                    '0 0 40px rgba(255, 255, 255, 0)',
                ]
                // scale: conceptIsDragging.overlap ? 1.1 : [0.9, 1]
            }}
            exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
            <motion.div
                initial={{ opacity: 0, boxShadow: '0 0 40px rgba(255, 255, 255, 0)' }}
                animate={{
                    opacity: conceptIsDragging.overlap ? 1 : 0.5,
                    // boxShadow: [
                    //     '0 0 0 rgba(255, 255, 255, 0)',
                    //     '0 0 20px rgba(255, 255, 255, 0.8)',
                    //     '0 0 40px rgba(255, 255, 255, 0)',
                    // ]
                }}
                exit={{ opacity: 0 }}
                className={styles.draggingMessage}
                transition={{
                    // boxShadow: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                    opacity: { duration: 0.5, ease: "easeInOut" }
                }}

            >
                <FaJournalWhills />
            </motion.div>

            <motion.svg className={styles.animatedContainer}>
                <JournalThread
                    d={`M 0 0 L ${draggingContainerRef?.current?.offsetWidth || 0} 0 L ${draggingContainerRef?.current?.offsetWidth || 0} ${draggingContainerRef?.current?.offsetHeight || 0} L 0 ${draggingContainerRef?.current?.offsetHeight || 0} Z`}
                    delay={0}
                    duration={0.3}
                    strokeWidth={1}
                    persist
                    opacity={0.8}
                    shouldAnimate={true}
                />
            </motion.svg>
        </motion.div>
    )
}