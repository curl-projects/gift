import styles from './ConceptStar.module.css'
import { motion, useAnimate, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';


export function ConceptStar({ selected, pulseTrigger, onClick, scale, animationDelay = 0 }){

    const [scope, animate] = useAnimate();

    useEffect(()=>{
        if(pulseTrigger > 0){
        animate(".conceptCircle", { scale: 0.9 }, { duration: 0.2, ease: 'easeInOut' })
        .then(() => animate(".conceptCircle", { scale: 1.1 }, { duration: 0.2, ease: 'easeInOut' }))
        .then(() => {
            animate(".conceptCircle", { scale: 1 }, { duration: 0.2, ease: 'easeInOut' });
            animate(`.ripple`, { scale: [0, 8], opacity: [1, 0], x: "-50%", y: "-50%" }, { duration: 1.5, ease: "easeOut" });
            });
        }
    }, [pulseTrigger])

    const ringVariants = {
        hidden: { scale: 0, x: "-50%", y: "-50%" },
        visible: (delay = 0) => ({
            scale: 1,
            x: "-50%", 
            y: "-50%",
            transition: { duration: 0.5, ease: "easeOut", delay: delay + animationDelay }
        })
    };    

    const dashedRingVariants = {
        hidden: { scale: 0, rotate: 0, x: "-50%", y: "-50%" },
        visible: {
            scale: 1.5,
            rotate: 360,
            x: "-50%",
            y: "-50%",
            transition: { duration: 1, ease: "easeOut", delay: animationDelay }
        },
        rotate: {
            rotate: [0, 360],
            transition: { repeat: Infinity, duration: 30, ease: "linear", delay: animationDelay }
        },
        exit: {
            scale: 0,
            x: "-50%",
            y: "-50%",
            transition: { duration: 0.3, ease: "easeIn", delay: animationDelay }
        }
    };

    
    return(
        <div 
            className={styles.circleContainer} 
            ref={scope} 
            onClick={onClick} 
            style={{ 
            transform: scale ? `scale(${scale})` : undefined
         }}>
        <AnimatePresence>
            {selected && (
                    <motion.div
                        key='selectionRing'
                        className={styles.selectionRing}
                        initial="hidden"
                        animate={["visible", "rotate"]}
                        exit="exit"
                        variants={dashedRingVariants}
                    />
                )}
        </AnimatePresence>

        <motion.div
                className={`${styles.outerRing} conceptCircle`}
                initial="hidden"
                animate="visible"
                custom={animationDelay + 1.0} // Delay for outer ring
                variants={ringVariants}
            />
            <motion.div
                className={`${styles.innerRing} conceptCircle`}
                initial="hidden"
                animate="visible"
                custom={animationDelay + 0.75} // Delay for inner ring
                variants={ringVariants}
            />
            <motion.div
                className={`${styles.glow} conceptCircle`}
                initial="hidden"
                animate="visible"
                custom={animationDelay + 0.5} // Delay for glow
                variants={ringVariants}
            />
            <motion.div
                className={`${styles.innerGlow} conceptCircle`}
                initial="hidden"
                animate="visible"
                custom={animationDelay + 0.25} // Delay for inner glow
                variants={ringVariants}
            />
            <motion.div
                className={`${styles.circle} conceptCircle`}
                initial="hidden"
                animate="visible"
                custom={animationDelay} // No delay for circle
                variants={ringVariants}
            />
            <motion.div
            initial="hidden"
            className={`${styles.ripple} ripple`}
             variants={ringVariants}
                transition={{ delay: 0 }}
            />
        </div>
    )
}