import { motion, AnimatePresence } from "framer-motion";
import styles from "./NarratorComponent.module.css";
import { InkBleed } from "~/components/canvas/custom-ui/post-processing-effects/InkBleed"

const NarratorComponent = ({ visible, text, requiresInteraction }) => {
    return (
        <AnimatePresence>
            {visible && (
                <>
                <motion.div
                    key='narrator-component'
                    className={styles.narratorContainer}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 3 }}
                >
                    <div className={styles.darkeningWrapper}>
                    <div className={styles.darkening} />
                    </div>

                </motion.div>
                <div className={styles.narratorContainerInner}>

                        {/* the key is used for re-triggering the animation */}
                        <InkBleed key={text} initialBlur={20} finalBlur={2} delay={0} duration={2} exitDuration={2}>
                            <p
                                className={styles.narratorText}
                                // initial={{ opacity: 0 }}
                                // animate={{ opacity: 1 }}
                                // exit={{ opacity: 0 }}
                                // transition={{ duration: 3 }}
                            >
                            {text}
                        </p>
                        </InkBleed>
                        {requiresInteraction && 
                         <InkBleed key={text} initialBlur={10} finalBlur={0.5} delay={1} duration={1} exitDuration={1}>
                            <p className={styles.narratorTextRequiresInteraction}>Press space</p>
                        </InkBleed>
                        }

                    </div>
                {/* <div className={styles.narratorTextContainer}> 
                    <div className={styles.narratorInnerTextContainer}>
                        <motion.p
                            className={styles.narratorText}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 3 }}
                        >
                            {text}
                        </motion.p>
                    </div>
                    </div> */}
                </>
            )}
        </AnimatePresence>
    );
};

export default NarratorComponent;
