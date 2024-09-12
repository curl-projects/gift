import { motion, AnimatePresence } from "framer-motion";
import styles from "./NarratorComponent.module.css";
import { InkBleed } from "~/components/canvas/custom-ui/post-processing-effects/InkBleed"
import { useEffect, useState } from "react";

const NarratorComponent = ({ visible, text, requiresInteraction }) => {
    const [numParticles, setNumParticles] = useState(50);

    useEffect(() => {
        const updateNumParticles = () => {
            const containerWidth = window.innerWidth;
            const particleDensity = 50 / 10; // 50 particles per 10em (original width)
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
        <AnimatePresence>
            {visible && (
                <>
                <motion.div
                    key='narrator-component'
                    className={styles.narratorContainer}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 7 }}
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
                                <motion.div 
                                    key={index} 
                                    className={styles.particle}
                                    style={{
                                        animationDelay: `${Math.random() * 4 }s`, // this has to be proportional to the speed of the rise animmation
                                        left: `calc((100% - 5em) * ${index} / ${numParticles})`
                                    }}
                                ></motion.div>
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
