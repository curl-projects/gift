import React from 'react';
import { motion } from 'framer-motion';
import styles from './Clouds.module.css';
import { useConstellationMode } from '~/components/canvas/custom-ui/utilities/ConstellationModeContext';

export function Clouds() {
    const { cloudControls } = useConstellationMode();

    return (
        <>
            <motion.div
                className={styles.cloudsOverlay}
                initial={{ opacity: 0, visibility: 'hidden' }}
                animate={{ opacity: cloudControls.visible ? 1 : 0, visibility: cloudControls.visible ? 'visible' : 'hidden' }}
                transition={{ duration: cloudControls.immediate ? 0 : 1 }}
            ></motion.div>
            <motion.div
                className={`${styles.cloudsOverlay} ${styles.cloudsOverlayReverse}`}
                initial={{ opacity: 0, visibility: 'hidden' }}
                animate={{ opacity: cloudControls.visible ? 1 : 0, visibility: cloudControls.visible ? 'visible' : 'hidden' }}
                transition={{ duration: cloudControls.immediate ? 0 : 1 }}
            ></motion.div>
        </>
    );
}