import styles from './JournalEntry.module.css'
import { JournalThread } from '~/components/canvas/shapes/journal-shape/parchment-journal/journal-thread/JournalThread.jsx'
import { motion } from 'framer-motion'
import { useRef, useEffect, useState } from 'react';
import { ConceptStar } from '~/components/canvas/shapes/concept-shape/ConceptStar';
import { EntryArticle } from './EntryArticle';

export function JournalEntry({ type, entry, shouldAnimate, opacity = 1, onMouseEnter, onMouseLeave, isHovered, isOtherHovered }) {
    const specimenRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [pulseTrigger, setPulseTrigger] = useState(0);

    useEffect(() => {
        if (specimenRef.current) {
            const { offsetWidth, offsetHeight } = specimenRef.current;
            setDimensions({ width: offsetWidth, height: offsetHeight });
        }
    }, []);

    return (
        <>
            <motion.div 
                className={styles.journalEntry}
                initial={{ opacity: shouldAnimate ? 0 : opacity, x: shouldAnimate ? -100 : 0 }}
                animate={{ opacity: opacity, x: 0 }}
                transition={{
                    opacity: { duration: 0.3, ease: "easeInOut", delay: 0},
                    x: { duration: 0.5, ease: "easeInOut", delay: 0.5 }
                }}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            >
                <div className={styles.entrySpecimenOuter}>
                    <div className={styles.entrySpecimen} ref={specimenRef}>
                        {type === 'concept' &&
                            <ConceptStar
                                selected={false}
                                pulseTrigger={pulseTrigger}
                                onClick={() => setPulseTrigger(pulseTrigger + 1)}
                                scale={1.2}
                                animationDelay={0.55}
                            />
                        }
                        {type === 'article' &&
                            <EntryArticle content={entry.html} />
                        }
                        <motion.svg className={styles.animatedContainer}>
                            <JournalThread
                                d={`M 0 0 L ${dimensions.width} 0 L ${dimensions.width} ${dimensions.height} L 0 ${dimensions.height} Z`}
                                delay={0.5}
                                duration={1}
                                strokeWidth={1}
                                persist
                                opacity={0.5}
                                shouldAnimate={shouldAnimate}
                            />
                        </motion.svg>
                    </div>
                </div>
                <motion.div 
                    className={styles.entryContent}
                    animate={{ scale: isHovered ? 1.01 : 1 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                    <motion.div className={styles.entryTitle}
                        initial={{ opacity: shouldAnimate ? 0 : 1, x: shouldAnimate ? -100 : 0 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, ease: "easeInOut", delay: 0.5 }}
                    >
                        {entry.title}
                    </motion.div>
                    <motion.div className={styles.entryMetadata}
                        initial={{ opacity: shouldAnimate ? 0 : 1, x: shouldAnimate ? -100 : 0 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, ease: "easeInOut", delay: 0.8 }}
                    >
                        {entry.author} • {entry.date}
                    </motion.div>
                    <motion.div className={styles.entryText}
                        initial={{ opacity: shouldAnimate ? 0 : 1, x: shouldAnimate ? -100 : 0 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, ease: "easeInOut", delay: 0.8 }}
                    >
                        {entry.content}
                    </motion.div>
                </motion.div>
            </motion.div>
            <div className={styles.divider}>
                <motion.div
                    className={styles.iconLine}
                    style={{ transformOrigin: 'left' }}
                    initial={{ scaleX: shouldAnimate ? 0 : 1 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5, ease: "easeInOut", }}
                />
                <div className={styles.innerIconContainer}>
                    <motion.svg
                        width="100"
                        height="100"
                        viewBox="0 0 100 100"
                        className={styles.innerIcon}
                    >
                        <motion.path
                            d="M50 10 L90 50 L50 90 L10 50 Z"
                            stroke="rgba(255, 255, 255, 0.2)"
                            strokeWidth="20px"
                            fill="transparent"
                            initial={{ pathLength: shouldAnimate ? 0 : 1 }}
                            animate={{ pathLength: 1 }}
                            transition={{
                                duration: 1,
                                ease: "easeInOut",
                                delay: 0.4,
                            }}
                        />
                    </motion.svg>
                </div>
                <motion.div
                    className={styles.iconLine}
                    style={{ transformOrigin: 'right' }}
                    initial={{ scaleX: shouldAnimate ? 0 : 1 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5, ease: "easeInOut", }}
                />
            </div>
        </>
    )
}