import { motion, AnimatePresence } from "framer-motion";
import styles from "./NarratorComponent.module.css";
import { InkBleed } from "~/components/canvas/custom-ui/post-processing-effects/InkBleed"

const NarratorComponent = ({ visible, text, requiresInteraction }) => {
    const parts = Array.from({ length: 50 });

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
                    <div className={styles.narratorContainerInner}>
                        <div className={styles.narratorContainerDarkening} />
                        <motion.p 
                            className={styles.narratorText}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 2 }}
                            >
                            {text}
                        </motion.p>
                        <div className={styles.fire}>
                            {parts.map((_, index) => (
                                <div 
                                    key={index} 
                                    className={styles.particle}
                                    style={{
                                        animationDelay: `${Math.random()}s`,
                                        left: `calc((100% - 5em) * ${index} / 50)`
                                    }}
                                ></div>
                            ))}
                        </div>
                    </div>
                </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default NarratorComponent;
