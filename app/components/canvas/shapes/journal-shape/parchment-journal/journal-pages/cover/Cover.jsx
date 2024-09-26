import styles from './Cover.module.css';
import journalStyles from "~/components/canvas/shapes/journal-shape/parchment-journal/ParchmentJournal.module.css"
import { InkBleed } from "~/components/canvas/custom-ui/post-processing-effects/InkBleed"
import { motion } from "framer-motion"

export function Cover(){
    
    const ringVariants = {
        hidden: { scale: 0, x: "-50%", y: "-50%" },
        visible: (delay = 0) => ({
            scale: 1,
            x: "-50%", 
            y: "-50%",
            transition: { duration: 0.5, ease: "easeOut", delay }
        })
    };
    
    const dashedRingVariants = {
        hidden: { scale: 0, rotate: 0, x: "-50%", y: "-50%" },
        visible: (delay = 0) => ({
            scale: 1.5, // Larger than the largest outer ring
            rotate: 360,
            x: "-50%",
            y: "-50%",
            transition: { duration: 1, ease: "easeOut", delay }
        }),
        rotate: {
            rotate: [0, 360],
            transition: { repeat: Infinity, duration: 10, ease: "linear" }
        },
        exit: {
            scale: 0,
            x: "-50%",
            y: "-50%",
            transition: { duration: 0.3, ease: "easeIn" }
        }
    };
    
    const orbitingRingVariants = {
        hidden: { scale: 0, rotate: 0, x: "-50%", y: "-50%" },
        visible: (custom) => ({
            scale: 1, // Larger than the largest outer ring
            rotate: 360,
            x: "-50%",
            y: "-50%",
            transition: { duration: 1, ease: "easeOut", delay: custom.delay }
        }),
        rotate: {
            rotate: [0, 360],
            transition: { repeat: Infinity, duration: 40, ease: "linear" }
        },
        exit: {
            scale: 0,
            rotate: 0,
            x: "-50%",
            y: "-50%",
            transition: { duration: 0.2, ease: "easeIn" }
        }
    };
    
    const moonVariants = {
        hidden: { scale: 0 },
        visible: {
            scale: 1,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };
    
    // Define animation variants for the moon's orbit
    const moonOrbitVariants = {
        rotate: {
            rotate: [0, 360],
            transition: { repeat: Infinity, duration: 10, ease: "linear" }
        },
        animate: {
            x: "-50%",
            y: "-50%",
        }
    };

    return(
        <div className={styles.coverLayout}>
            <InkBleed
                initialBlur={4}
                delay={0}
                duration={0.5}>
                    <h1 className={journalStyles.journalLargeText}>Starlight</h1>
            </InkBleed>
            <div className={styles.outerCircleContainer}>
                <div className={styles.circleContainer}>
                    <motion.div
                        className={`${styles.extremeOuterRing} nameCircle`}
                        initial="hidden"
                        animate="visible"
                        custom={randomDelay + 1.5} // Delay for outermost ring
                        variants={ringVariants}
                    />
                     <motion.div
                        className={`${styles.moonOrbit} nameCircle`}
                        variants={moonOrbitVariants}
                        animate={["animate", "rotate"]}
                    >
                        <motion.div
                            className={styles.moon}
                            initial="hidden"
                            animate="visible"
                            variants={moonVariants}
                        />
                    </motion.div>
                    <motion.div
                        className={`${styles.mostOuterRing} nameCircle`}
                        initial="hidden"
                        animate="visible"
                        custom={randomDelay + 1.25} // Delay for outer ring
                        variants={ringVariants}
                    />
                    <motion.div
                        className={`${styles.outerRing} nameCircle`}
                        initial="hidden"
                        animate="visible"
                        custom={randomDelay + 1.0} // Delay for outer ring
                        variants={ringVariants}
                    />
                    <motion.div
                        className={`${styles.innerRing} nameCircle`}
                        initial="hidden"
                        animate="visible"
                        custom={randomDelay + 0.75} // Delay for inner ring
                        variants={ringVariants}
                    />
                    <motion.div
                        className={`${styles.glow} nameCircle`}
                        initial="hidden"
                        animate="visible"
                        custom={randomDelay + 0.5} // Delay for glow
                        variants={ringVariants}
                    />
                    <motion.div
                        className={`${styles.innerGlow} nameCircle`}
                        initial="hidden"
                        animate="visible"
                        custom={randomDelay + 0.25} // Delay for inner glow
                        variants={ringVariants}
                    />
                    <motion.div
                        className={`${styles.circle} nameCircle`}
                        initial="hidden"
                        animate="visible"
                        custom={randomDelay} // No delay for circle
                        variants={ringVariants}
                    />
                    <motion.div
                        initial="hidden"
                        className={`${styles.ripple} ripple`}
                        variants={ringVariants}
                        transition={{ delay: 0 }}
                    />
            
                   
                </div>
            </div>
        </div>
    )
}
