import { motion, AnimatePresence } from "framer-motion";
import styles from "./SystemComponent.module.css";

const SystemComponent = ({ visible, text }) => {
    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    className={styles.systemContainer}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 3 }}
                >
                    <motion.p
                        className={styles.systemText}
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

export default SystemComponent;
