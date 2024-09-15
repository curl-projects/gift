import { motion, AnimatePresence } from "framer-motion";
import styles from "./GameNarratorComponent.module.css";
import { useEffect, useState, memo } from "react";
import { Stars } from '~/components/canvas/custom-ui/aesthetics/stars/Stars';
import { Clouds } from '~/components/canvas/custom-ui/aesthetics/clouds/Clouds';

const GameNarratorComponent = ({ visible, text, requiresInteraction, exitDuration, onComplete }) => {
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
                    transition={{ duration: 4 }}
                    onAnimationComplete={() => {
                        onComplete && onComplete();
                    }}
                >
                    <div className={styles.narratorContainerInner}>
                        <div className={styles.narratorContainerDarkening} />
                            {/* <motion.p 
                                key={text} // Use text as key to trigger re-animation
                                className={styles.narratorText}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0 }}
                                exit={{ opacity: 0 }}
                            >
                                {text}
                            </motion.p> */}
                        {/* <FireAnimation /> */}
                    </div>    
                </motion.div>
                {/*actual text -- the other one controls the spacing of the border */}
                <motion.div 
                    key='narrator-text-absolute-container'
                    className={styles.narratorTextAbsoluteContainer}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: exitDuration / 1000 || 2 }} // todo: there's hardcoded stuff in handleKeyDown related to this
                >
                    <AnimatePresence mode="wait">
                       
                        <motion.p 
                            key={text} // Use text as key to trigger re-animation
                            className={styles.narratorText}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 2 }}
                        >
                                {text}
                            </motion.p>
                       
                    </AnimatePresence>
                    </motion.div>
                <motion.div 
                    className={styles.narratorTextBackdrop}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2 }}
                >
                    <Stars />
                    <Clouds absoluteMode />
                </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default GameNarratorComponent;
