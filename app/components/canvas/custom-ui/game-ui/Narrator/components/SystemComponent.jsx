import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import styles from "./SystemComponent.module.css";
import { TextScramble } from "~/components/canvas/custom-ui/post-processing-effects/text-scramble/TextScramble";

const SystemComponent = ({ visible, text, requiresInteraction, delay, textDelay = 0, onComplete = null}) => {
    const textRef = useRef(null);
    const [animationComplete, setAnimationComplete] = useState(false);

    useEffect(() => {
        if (visible && textRef.current) {
            // Initialize with scrambled text
            const scrambledText = text.split('').map(() => '!<>-_\\/[]{}—=+*^?#________'[Math.floor(Math.random() * 20)]).join('');
            textRef.current.innerHTML = scrambledText;
        }
    }, [visible]);

    useEffect(() => {
        if (visible && textRef.current && animationComplete) {
            const fx = new TextScramble(textRef.current, styles.dud);
            setTimeout(() => {
                fx.setText(text);
            }, textDelay);
        }
    }, [visible, text, animationComplete, textDelay]);

    useEffect(()=>{
        console.log("visible", visible)
    }, [visible])

    return (
        <AnimatePresence>
            {visible && (
                <>
                <motion.div
                    key='system-component'
                    className={styles.systemContainer}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 3, delay: delay || 0}}
                    onAnimationStart={() => {
                        const textDelay = 1000 + (delay || 0) // text delay so the animation starts when it's partially visible
                       
                        setTimeout(() => {
                             onComplete && onComplete();
                            setAnimationComplete(true)
                        }, textDelay)
                    }}
                >
                    <div className={styles.systemContainerInner}>
                        <div className={styles.systemContainerDarkening} />
                        <motion.p 
                            className={styles.systemText}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 2 }}
                            >
                            <span ref={textRef}></span>
                        </motion.p>
                    </div>
                </motion.div>
                <AnimatePresence mode="wait">
                    <motion.p 
                        key={text}
                        className={styles.nextButtonContainer}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: requiresInteraction ? 1 : 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 2, delay: 1 }}
                    >
                        press space to continue
                    </motion.p>
                </AnimatePresence>
                </>
                
            )}
        </AnimatePresence>
    );
};

export default SystemComponent;
