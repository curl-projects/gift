import { motion, AnimatePresence } from "framer-motion";
import styles from "./NarratorComponent.module.css";
import { InkBleed } from "~/components/canvas/custom-ui/post-processing-effects/InkBleed"
import { useEffect, useState, memo } from "react";

const FireAnimation = memo(() => {
    const [numParticles, setNumParticles] = useState(50);

    useEffect(() => {
        const updateNumParticles = () => {
            const containerWidth = window.innerWidth;
            const particleDensity = 100 / 10; // 100 particles per 10em (original width)
            const newNumParticles = Math.floor(containerWidth * particleDensity / 100);
            setNumParticles(newNumParticles);
        };

        updateNumParticles();
        window.addEventListener('resize', updateNumParticles);

        return () => {
            window.removeEventListener('resize', updateNumParticles);
        };
    }, []);

    const parts = Array.from({ length: numParticles });

    return (
        <div className={styles.fire}>
            {parts.map((_, index) => (
                <div 
                    key={index} 
                    className={styles.particle}
                    style={{
                        animationDelay: `-${Math.random() * 4}s`, // Random delay up to 2s
                        left: `calc((100% - 5em) * ${index} / ${numParticles})`,
                    }}
                ></div>
            ))}
        </div>
    );
});

const NarratorComponent = ({ visible, text, requiresInteraction }) => {
    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    key='narrator-component'
                    className={styles.narratorContainer}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 4 }}
                >
                    <div className={styles.narratorContainerInner}>
                        <div className={styles.narratorContainerDarkening} />
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
                        {/* <FireAnimation /> */}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NarratorComponent;
