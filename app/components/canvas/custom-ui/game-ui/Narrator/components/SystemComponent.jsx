import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import styles from "./SystemComponent.module.css";
import { TextScramble } from "~/components/canvas/custom-ui/post-processing-effects/text-scramble/TextScramble";

const SystemComponent = ({ visible, text }) => {
    const textRef = useRef(null);
    const [animationComplete, setAnimationComplete] = useState(false);

    useEffect(() => {
        if (visible && textRef.current) {
            // Initialize with scrambled text
            const scrambledText = text.split('').map(() => '!<>-_\\/[]{}—=+*^?#________'[Math.floor(Math.random() * 20)]).join('');
            textRef.current.innerHTML = scrambledText;
        }
    }, [visible, text]);

    useEffect(() => {
        if (visible && textRef.current && animationComplete) {
            const fx = new TextScramble(textRef.current);
            fx.setText(text);
        }
    }, [visible, text, animationComplete]);

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
                    onAnimationComplete={() => setAnimationComplete(true)}
                >
                    <div className={styles.systemContainerInner}>
                        <div className={styles.systemContainerDarkening} />
                        <p
                            className={styles.systemText}
                        >
                            <div ref={textRef}></div>
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SystemComponent;
