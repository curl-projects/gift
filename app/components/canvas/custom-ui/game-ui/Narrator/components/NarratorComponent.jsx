import { motion, AnimatePresence } from "framer-motion";
import styles from "./NarratorComponent.module.css";

const NarratorComponent = ({ visible, text }) => {
    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    className={styles.narratorContainer}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 3 }}
                >
                    <motion.p
                        className={styles.narratorText}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 3 }}
                    >
                        {text}
                    </motion.p>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NarratorComponent;
