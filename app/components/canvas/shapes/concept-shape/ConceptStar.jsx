import styles from './ConceptStar.module.css'
import { motion, useAnimate, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export function ConceptStar({ selected, pulseTrigger, onClick, scale, animationDelay = 0, collapsed = true }){

    const [scope, animate] = useAnimate();

    useEffect(()=>{
        if(pulseTrigger > 0){
            if (collapsed) {
                animate(".conceptCircle", { scale: 0.675 }, { duration: 0.2, ease: 'easeInOut' }) // 0.75 * 0.9
                .then(() => animate(".conceptCircle", { scale: 0.825 }, { duration: 0.2, ease: 'easeInOut' })) // 0.75 * 1.1
                .then(() => {
                    animate(".conceptCircle", { scale: 0.75 }, { duration: 0.2, ease: 'easeInOut' }); // Baseline 0.75
                    animate(`.ripple`, { scale: [0, 8], opacity: [1, 0], x: "-50%", y: "-50%" }, { duration: 1.5, ease: "easeOut" });
                });
            } else {
                animate(".conceptCircle", { scale: 0.9 }, { duration: 0.2, ease: 'easeInOut' })
                .then(() => animate(".conceptCircle", { scale: 1.1 }, { duration: 0.2, ease: 'easeInOut' }))
                .then(() => {
                    animate(".conceptCircle", { scale: 1 }, { duration: 0.2, ease: 'easeInOut' });
                    animate(`.ripple`, { scale: [0, 8], opacity: [1, 0], x: "-50%", y: "-50%" }, { duration: 1.5, ease: "easeOut" });
                });
            }
        }
    }, [pulseTrigger])

    const ringVariants = {
        hidden: { scale: 0, x: "-50%", y: "-50%" },
        visible: (delay = 0) => ({
            scale: 1,
            x: "-50%", 
            y: "-50%",
            transition: { duration: 0.5, ease: "easeOut", delay: delay + animationDelay }
        }),
        collapsed: { scale: 0, opacity: 0, transition: { duration: 0.5, ease: "easeIn" } }
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
        },
        collapsed: {
            scale: 0.5,
            x: "-50%",
            y: "-50%",
            transition: { duration: 0.5, ease: "easeInOut" }
        }
    };

    const circleVariants = {
        hidden: { scale: 0, x: "-50%", y: "-50%" },
        visible: { scale: 1, x: "-50%", y: "-50%", transition: { duration: 0.5, ease: "easeOut" } },
        collapsed: { scale: 0.75, x: "-50%", y: "-50%", transition: { duration: 0.5, ease: "easeIn" } }
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
                        animate={collapsed ? "collapsed" : ["visible", "rotate"]}
                        exit="exit"
                        variants={dashedRingVariants}
                    />
                )}
        </AnimatePresence>

        <motion.div
                className={`${styles.outerRing} conceptCircle`}
                initial="hidden"
                animate={collapsed ? "collapsed" : "visible"}
                custom={animationDelay + 1.0} // Delay for outer ring
                variants={ringVariants}
            />
            <motion.div
                className={`${styles.innerRing} conceptCircle`}
                initial="hidden"
                animate={collapsed ? "collapsed" : "visible"}
                custom={animationDelay + 0.75} // Delay for inner ring
                variants={ringVariants}
            />
            <motion.div
                className={`${styles.glow} conceptCircle`}
                initial="hidden"
                animate={collapsed ? "collapsed" : "visible"}
                custom={animationDelay + 0.5} // Delay for glow
                variants={ringVariants}
            />
            <motion.div
                className={`${styles.innerGlow} conceptCircle`}
                initial="hidden"
                animate={collapsed ? "collapsed" : "visible"}
                custom={animationDelay + 0.25} // Delay for inner glow
                variants={circleVariants}
            />
            <motion.div
                className={`${styles.circle} conceptCircle`}
                initial="hidden"
                animate={collapsed ? "collapsed" : "visible"}
                custom={animationDelay} // No delay for circle
                variants={circleVariants}
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