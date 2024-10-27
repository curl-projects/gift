import styles from "./CloudDarkeningPainter.module.css";
import { useStarFireSync } from "~/components/synchronization/StarFireSync";
import { motion } from "framer-motion";

export function CloudDarkeningPainter(){
    const { cloudDarkeningControls } = useStarFireSync();

    return(
        <div
        key='title-component'
        className={styles.darkeningContainer}
        >
            <div className={styles.darkeningContainerInner}>
                <motion.div 
                    key="title-darkening"
                    className={styles.darkening}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: cloudDarkeningControls.visible ? 1 : 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: cloudDarkeningControls.immediate ? 0 : (cloudDarkeningControls.duration || 1), delay: cloudDarkeningControls.delay || 0 }}
                    style={{
                        background: `linear-gradient(to right, ${cloudDarkeningControls.colors.join(', ')})`
                    }}
                    onAnimationComplete={() => {
                        cloudDarkeningControls.onComplete && cloudDarkeningControls.onComplete()
                    }}
                />
            </div>    
        </div>
    )
}
