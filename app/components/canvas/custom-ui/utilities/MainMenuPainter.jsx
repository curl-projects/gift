import styles from "./MainMenuPainter.module.css"
import { useState, useEffect } from "react"
import { useStarFireSync } from '~/components/synchronization/StarFireSync';
import { motion, AnimatePresence } from "framer-motion";

export function MainMenuPainter() {
    const { narratorEvent, setNarratorEvent } = useStarFireSync();
    const menuItems = [
        {
            name: 'Home',
            onClick: () => {
                setNarratorEvent('pitch')
            },
            narratorEvent: 'pitch'
        },
        {
            name: 'Elevator Pitch + Market Analysis',
            onClick: () => {
                setNarratorEvent('elevator-pitch')
            },
            narratorEvent: 'elevator-pitch'
        },
        {
            name: "Design Philosophy",
            onClick: () => {
                setNarratorEvent('design-philosophy')
            },
            narratorEvent: 'design-philosophy'
        },
        {
            name: "Mechanics",
            onClick: () => {
                setNarratorEvent('mechanics')
            },
            narratorEvent: 'mechanics'
        },
        {
            name: "Technical Foundations",
            onClick: () => {
                setNarratorEvent('technical-foundations')
            },
            narratorEvent: 'technical-foundations'
        },
        {
            name: "Why is this Important?",
            onClick: () => {
                setNarratorEvent('justification')
            },
            narratorEvent: 'justification'
        }
    ]

    return(
        <div className={styles.mainMenu}>
            <AnimatePresence>
                
            {menuItems.map((item, idx) => 
                (item.name === 'Home' || ['pitch'].includes(narratorEvent)) &&
                    <motion.p 
                        className={styles.menuItem} 
                        key={`${idx}-${item.name}`} 
                        onPointerDown={item.onClick}
                        style={{
                            // display: (item.name !== 'Home' && narratorEvent !== 'pitch') ? 'none' : 'block',
                            textDecoration: narratorEvent === item.narratorEvent ? 'underline' : 'none'
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 2 } }}
                        transition={{ duration: 2, delay: idx * 0.25 }}
                    >
                        {/* {item.name === 'Home' && 
                            <span className={styles.circleContainer}>
                                <HomeIcon />
                            </span>} */}
                        {item.name}
                        </motion.p>
            
            )}
            </AnimatePresence>
        </div>
    )
}

export function HomeIcon() {
    return (
        <>
        <span className={`${styles.mostOuterRing} nameCircle`} />
        <span className={`${styles.outerRing} nameCircle`} />
        <span className={`${styles.innerRing} nameCircle`} />
        <span className={`${styles.glow} nameCircle`} />
        <span className={`${styles.innerGlow} nameCircle`} />
        <span className={`${styles.circle} nameCircle`} />
        </>
    )
}