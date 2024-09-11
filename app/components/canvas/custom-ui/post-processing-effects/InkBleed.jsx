import styles from './InkBleed.module.css'
import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export function InkBleed({ children, initialBlur = 4, delay = 0, duration=1, finalBlur=1, exitDuration=0.5, key=null }){
    const containerRef = useRef(null);
    const isInView = useInView(containerRef, { once: true });

    return(
        <div className={styles.inkBleedContainer} ref={containerRef}>
            <div className={styles.overlay} />
            <div className={styles.overlayTwo} />
                <div className={styles.main}>
                    <motion.div 
                        key={key}
                        className={styles.design}
                        initial={{ filter: `blur(${initialBlur}px)` }}
                        animate={isInView ? { filter: `blur(${finalBlur}px)` } : {}}
                        exit={{ filter: `blur(${initialBlur}px)`, transition: { duration: exitDuration } }}
                        transition={{ duration, delay }}
                    >
                        {children}
                    </motion.div>
                </div>
            </div>
    )
}