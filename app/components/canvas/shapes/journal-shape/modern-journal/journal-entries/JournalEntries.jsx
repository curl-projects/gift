import styles from './JournalEntries.module.css'
import { JournalEntry } from './JournalEntry'
import { motion } from 'framer-motion'
import React from 'react'

const mockEntries = [
    {
        type: 'concept',
        title: "Immersive Storytelling",
        content: "Software, to be transformative, must manifest the emotive tools of game design.",
        author: "Andre Vacha",
        date: "2024-02-20"
    },
    {
        type: "article",
        title: "Game Design in Software v2",
        content: "...we must move beyond the current paradigm of software...",
        author: "Finn Macken",
        date: "2024-03-05",
        html: "<h1>Hello</h1><p>My name is Finn"
    }
]
export function JournalEntries(){
    return <div className={styles.journalEntries}>
        {mockEntries.map((entry, index) => (
            <React.Fragment key={index}>
                <JournalEntry 
                    type={entry.type} 
                    entry={entry} 
                />
                <div className={styles.divider}>
                    <motion.div
                        className={styles.iconLine}
                        style={{ transformOrigin: 'left' }}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.5, ease: "easeInOut",}}
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
                                initial={{ pathLength: 0 }}
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
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.5, ease: "easeInOut",}}
                    />
                </div>
            </React.Fragment>
        ))}
    </div>
};
