import styles from './JournalEntries.module.css'
import { JournalEntry } from './JournalEntry'
import { motion } from 'framer-motion'
import React from 'react'
import { useStarFireSync } from '~/components/synchronization/StarFireSync'

export function JournalEntries(){
    const { entries } = useStarFireSync()
    const prevLengthRef = React.useRef(entries.length)
    const [hoveredIndex, setHoveredIndex] = React.useState(null)

    const isNewEntryAdded = entries.length > prevLengthRef.current

    React.useEffect(() => {
        prevLengthRef.current = entries.length
    }, [entries.length])

    return (
        <div className={styles.journalEntries}>
            {entries.slice().reverse().map((entry, index) => {
                const isHovered = hoveredIndex === index
                const isOtherHovered = hoveredIndex !== null && !isHovered
                let opacityForEntry = isNewEntryAdded ? (index === 0 ? 0.3 : 1) : 1

                if (hoveredIndex !== null) {
                    opacityForEntry = isOtherHovered ? 0.6 : opacityForEntry
                }

                return (
                    <React.Fragment key={index}>
                        <JournalEntry 
                            type={entry.type} 
                            entry={entry} 
                            shouldAnimate={isNewEntryAdded ? (index === 0 ? true : false) : true}
                            opacity={opacityForEntry}
                            isHovered={isHovered}
                            isOtherHovered={isOtherHovered}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        />
                    </React.Fragment>
                )
            })}
        </div>
    )
}
