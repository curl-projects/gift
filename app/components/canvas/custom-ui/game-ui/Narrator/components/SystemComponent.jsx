import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import styles from "./SystemComponent.module.css";
import { TextScramble } from "~/components/canvas/custom-ui/post-processing-effects/text-scramble/TextScramble";

const SystemComponent = ({ visible, text, headerText, textAlign, requiresInteraction, delay, nextButtonVisible, setNextButtonVisible, textDelay = 0, onComplete = null}) => {
    const textRef = useRef(null);
    const headerTextRef = useRef(null); // New ref for headerText
    const [animationComplete, setAnimationComplete] = useState(false);

    useEffect(()=>{
        console.log("nextButtonVisible", nextButtonVisible)
    }, [nextButtonVisible])

    useEffect(() => {
        console.log("headerTextOuter", headerText)
        if (visible && text && textRef.current) {
            // Initialize with scrambled text
            const scrambledText = text.split('').map(() => '!<>-_\\/[]{}—=+*^?#________'[Math.floor(Math.random() * 20)]).join('');
            textRef.current.innerHTML = scrambledText;
        }
        if (visible && headerText && headerTextRef.current) {
            console.log("headerText", headerText)
            // Initialize with scrambled header text
            const scrambledHeaderText = headerText.split('').map(() => '!<>-_\\/[]{}—=+*^?#________'[Math.floor(Math.random() * 20)]).join('');
            headerTextRef.current.innerHTML = scrambledHeaderText;
        }
    }, [visible, text, headerText]);

    useEffect(() => {
        if (visible && text && textRef.current && animationComplete) {
            const fx = new TextScramble(textRef.current, styles.dud);
            setTimeout(() => {
                fx.setText(text);
                setNextButtonVisible(true);
            }, textDelay);
        }
        if (visible && headerText && headerTextRef.current && animationComplete) {
            const fxHeader = new TextScramble(headerTextRef.current, styles.dud);
            setTimeout(() => {
                console.log("headerText", headerText)
                fxHeader.setText(headerText);
            }, textDelay);
        }
    }, [visible, text, headerText, animationComplete, textDelay]);

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
                            style={{
                                textAlign: textAlign || 'center'
                            }}
                            transition={{ duration: 2 }}
                            onAnimationComplete={(animation) => {
                                console.log("system text animation", animation)
                                if(animation.opacity === 1){
                                    setNextButtonVisible(true);
                                }
                            }} 
                            >
                            <span ref={headerTextRef} className={styles.systemHeaderText}></span> 
                            <span ref={textRef}></span>
                        </motion.p>
                    </div>
                </motion.div>
                <AnimatePresence>
                    {nextButtonVisible && (
                        <div className={styles.nextButtonContainerWrapper}>
                            <motion.p 
                                key="next-button-container"
                                className={styles.nextButtonContainer}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: requiresInteraction ? 1 : 0 }}
                                exit={{ opacity: 0, transition: { duration: 0 } }}
                                transition={{ duration: 1, delay: 0 }}
                            >
                                press space to continue
                            </motion.p>
                        </div>
                        )}
                </AnimatePresence>
                </>
                
            )}
        </AnimatePresence>
    );
};

export default SystemComponent;
