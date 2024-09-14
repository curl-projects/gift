import { motion, AnimatePresence } from "framer-motion";
import styles from "./NarratorComponent.module.css";
import { InkBleed } from "~/components/canvas/custom-ui/post-processing-effects/InkBleed"
import { useEffect, useState, memo } from "react";

const NarratorComponent = ({ 
    visible, 
    text, 
    requiresInteraction, 
    exitDuration, 
    onComplete,
    darkeningVisible=true, 
    darkeningDuration=2,
    nextButtonVisible=false
}) => {

    useEffect(() => {
        console.log("darkeningVisible", darkeningVisible);
        console.log("darkeningDuration", darkeningDuration);
    }, [darkeningVisible, darkeningDuration]);

    return (
        <AnimatePresence>
            {visible && (
                <>
                <motion.div
                    key='narrator-component'
                    className={styles.narratorContainer}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: darkeningVisible ? 1 : 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: darkeningDuration }}
                    onAnimationComplete={() => {
                        console.log("animation complete (darkening)")
                        onComplete && onComplete();
                    }}
                >
                    <div className={styles.narratorContainerInner}>
                        <div  className={styles.narratorContainerDarkening}
                            />
                            <motion.p 
                                key={text} // Use text as key to trigger re-animation
                                className={styles.narratorText}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0 }}
                                exit={{ opacity: 0 }}
                            >
                                {text}
                            </motion.p>
                        {/* <FireAnimation /> */}
                    </div>    
                </motion.div>
              
                
                <motion.div 
                    key='narrator-text-absolute-container'
                    className={styles.narratorTextAbsoluteContainer}
                    initial={{ opacity:  0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2 }} // there's hardcoded stuff in handleKeyDown 
                >
                    <AnimatePresence mode="wait">
                       
                        <motion.p 
                            key={text} // Use text as key to trigger re-animation when text changes
                            className={styles.narratorText}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 2 }}
                            onAnimationComplete={() => {
                                console.log("animation complete (text)")
                                onComplete && onComplete();
                            }}
                        >
                                {text}
                            </motion.p>
                       
                    </AnimatePresence>
                    </motion.div>
                    <motion.p 
                        key={text}
                        className={styles.nextButtonContainer}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: requiresInteraction ? 1 : 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 4, delay: 0.5 }}
                    >
                        press space to continue
                    </motion.p>
                </>
            )}
        </AnimatePresence>
    );
};

export default NarratorComponent;


// const FireAnimation = memo(() => {
//     const [numParticles, setNumParticles] = useState(50);

//     useEffect(() => {
//         const updateNumParticles = () => {
//             const containerWidth = window.innerWidth;
//             const particleDensity = 100 / 10; // 100 particles per 10em (original width)
//             const newNumParticles = Math.floor(containerWidth * particleDensity / 100);
//             setNumParticles(newNumParticles);
//         };

//         updateNumParticles();
//         window.addEventListener('resize', updateNumParticles);

//         return () => {
//             window.removeEventListener('resize', updateNumParticles);
//         };
//     }, []);

//     const parts = Array.from({ length: numParticles });

//     return (
//         <div className={styles.fire}>
//             {parts.map((_, index) => (
//                 <div 
//                     key={index} 
//                     className={styles.particle}
//                     style={{
//                         animationDelay: `-${Math.random() * 4}s`, // Random delay up to 2s
//                         left: `calc((100% - 5em) * ${index} / ${numParticles})`,
//                     }}
//                 ></div>
//             ))}
//         </div>
//     );
// });
