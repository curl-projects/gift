import styles from './JournalEntries.module.css'
import { JournalEntry } from './JournalEntry'
import { motion } from 'framer-motion'
import React, { useEffect, useRef, useState} from 'react'
import { useStarFireSync } from '~/components/synchronization/StarFireSync'

export function JournalEntries(){
    const { entries } = useStarFireSync()
    const [hoveredIndex, setHoveredIndex] = useState(null)
    const [isNewEntryAdded, setIsNewEntryAdded] = useState(false)


    useEffect(() => {
        if (entries.prevValues.length > 0 && (entries.values.length > entries.prevValues.length)){
            setIsNewEntryAdded(true)
        } 
    }, [entries])

    useEffect(() => {
        console.log("IS NEW ENTRY ADDED", isNewEntryAdded)
    }, [isNewEntryAdded])

    return (
        <div className={styles.journalEntries}>
            {entries.values.slice().reverse().map((entry, index) => {
                const isHovered = hoveredIndex === index
                const isOtherHovered = hoveredIndex !== null && !isHovered
                
                let opacityForEntry = isNewEntryAdded ? (index === 0 ? 1 : 0.1) : 1

                if (hoveredIndex !== null) {
                    opacityForEntry = isOtherHovered ? 0.6 : opacityForEntry
                }

                return (
                    <React.Fragment key={entry.id}>
                        <JournalEntry 
                            key={entry.id}
                            type={entry.type} 
                            entry={entry} 
                            // shouldAnimate={
                            //     // isNewEntryAdded ? true : false
                            //     // index === 0 ? true : false
                            //     isNewEntryAdded ? (index === 0 ? true : false) : true
                            // }
                            shouldAnimate={true}
                            opacity={opacityForEntry}
                            isHovered={isHovered}
                            isOtherHovered={isOtherHovered}
                            onMouseEnter={() => {
                                setHoveredIndex(index)
                                isNewEntryAdded && index !== 0 && setIsNewEntryAdded(false)
                            }}
                            
                            onMouseLeave={() => setHoveredIndex(null)}
                        />
                    </React.Fragment>
                )
            })}
        </div>
    )
}
