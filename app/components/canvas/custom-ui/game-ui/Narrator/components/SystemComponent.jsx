import { motion, AnimatePresence } from "framer-motion";
import styles from "./SystemComponent.module.css";

const SystemComponent = ({ visible, text }) => {
    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    key='system-component'
                    className={styles.systemContainer}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 3 }}
                >
                    <div className={styles.systemContainerInner}>
                        <div className={styles.systemContainerDarkening} />
                    
                    <motion.p
                        className={styles.systemText}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 3 }}
                    >
                        <div className=''></div>
                        {text}
                    </motion.p>
                    </div>
                </motion.div>

            )}
        </AnimatePresence>
    );
};

export default SystemComponent;
