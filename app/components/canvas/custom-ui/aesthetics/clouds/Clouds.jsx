import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from './Clouds.module.css';
import { useConstellationMode } from '~/components/canvas/custom-ui/utilities/ConstellationModeContext';
import { useStarFireSync } from '~/components/synchronization/StarFireSync';
export function Clouds({ absoluteMode = false }) {
    const { cloudControls } = useStarFireSync();
    const onCompleteRef = useRef(cloudControls.onComplete);

    useEffect(() => {
        onCompleteRef.current = cloudControls.onComplete;
    }, [cloudControls.onComplete]);

    return (
        <>
            <motion.div
                className={styles.cloudsOverlay}
                style={{
                    position: absoluteMode ? 'absolute' : 'fixed',
                }}
                initial={{ opacity: 0, visibility: 'hidden' }}
                animate={{ opacity: cloudControls?.visible ? 1 : 0, visibility: cloudControls?.visible ? 'visible' : 'hidden' }}
                transition={{ duration: cloudControls?.immediate ? 0 : 1 }}
                onAnimationComplete={() => {
                    cloudControls.onComplete && cloudControls.onComplete();
                }}
            ></motion.div>
            <motion.div
                style={{
                    position: absoluteMode ? 'absolute' : 'fixed',
                }}
                className={`${styles.cloudsOverlay} ${styles.cloudsOverlayReverse}`}
                initial={{ opacity: 0, visibility: 'hidden' }}
                animate={{ opacity: cloudControls?.visible ? 1 : 0, visibility: cloudControls?.visible ? 'visible' : 'hidden' }}
                transition={{ duration: cloudControls?.immediate ? 0 : 1 }}
            ></motion.div>
        </>
    );
} 