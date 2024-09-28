import styles from './BrowserWarning.module.css'
import { useState, useEffect } from 'react';
import {motion} from 'framer-motion';
import { isChrome, isSafari, isEdge, isFirefox, isOpera, isIE } from 'react-device-detect';
export function BrowserWarning(){
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible || isChrome) return null;

    if(isSafari){
        return(
            <motion.div 
        className={styles.browserWarning}
        initial={{ opacity: 0, }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        >
            <div className={styles.browserWarningContent}>
                <p className={styles.browserWarningText}>
                    Hello! Finn here! You're using Safari right now, which is not fully supported yet. For best performance, please use Chrome or Arc.
                </p>
                <p className={styles.browserWarningText}>
                    Most of the demo should work in Safari, with some slight styling issues, documented below:
                </p>
                <ul className={styles.browserWarningText}>
                    <li>Some svg effects like roughness don't work due to Webkit limitations</li>
                </ul>
            </div>
            <button className={styles.closeButton} onClick={() => {
                setIsVisible(false);
            }}>
                Close
            </button>
            </motion.div>
        )
    }
    else if(isEdge){
        return(
            <motion.div 
        className={styles.browserWarning}
        initial={{ opacity: 0, }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        >
            <div className={styles.browserWarningContent}>
                <p className={styles.browserWarningText}>
                    Hello! Finn here! You're using Edge right now, which is not fully supported yet. For best performance, please use Chrome or Arc.
                </p>
                <p className={styles.browserWarningText}>
                    Right now the demo's completely broken in Edge -- working on it!
                </p>
                {/* <ul className={styles.browserWarningText}>
                    <li></li>
                </ul> */}
            </div>
            <button className={styles.closeButton} onClick={() => {
                setIsVisible(false);
            }}>
                Close
            </button>
            </motion.div>
        )
    }
    else if(isFirefox){
        return(
            <motion.div 
        className={styles.browserWarning}
        initial={{ opacity: 0, }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        >
            <div className={styles.browserWarningContent}>
                <p className={styles.browserWarningText}>
                    Hello! Finn here! You're using Firefox right now, which is not fully supported yet. For best performance, please use Chrome or Arc.
                </p>
                <p className={styles.browserWarningText}>
                    Most of the demo should work in Firefox, with some slight styling issues, documented below:
                </p>
                <ul className={styles.browserWarningText}>
                    <li></li>
                </ul>
            </div>
            <button className={styles.closeButton} onClick={() => {
                setIsVisible(false);
            }}>
                Close
            </button>
            </motion.div>
        )
    }
    else if(isOpera){
        return(
            <motion.div 
        className={styles.browserWarning}
        initial={{ opacity: 0, }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        >
            <div className={styles.browserWarningContent}>
                <p className={styles.browserWarningText}>
                    Hello! Finn here! You're using Edge right now, which is not fully supported yet. For best performance, please use Chrome or Arc.
                </p>
                <p className={styles.browserWarningText}>
                    Most of the demo should work in Edge, with some slight styling issues, documented below:
                </p>
                <ul className={styles.browserWarningText}>
                    <li></li>
                </ul>
            </div>
            <button className={styles.closeButton} onClick={() => {
                setIsVisible(false);
            }}>
                Close
            </button>
            </motion.div>
        )
    }
    else if(isIE){
        return(
            <motion.div 
        className={styles.browserWarning}
        initial={{ opacity: 0, }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        >
            <div className={styles.browserWarningContent}>
                <p className={styles.browserWarningText}>
                    Hello! Finn here! You're using Internet Explorer right now? Really? For best performance, please use Chrome.
                </p>
    
            </div>
            <button className={styles.closeButton} onClick={() => {
                setIsVisible(false);
            }}>
                Close
            </button>
            </motion.div>
        )
    }
    else{
        <motion.div 
        className={styles.browserWarning}
        initial={{ opacity: 0, }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        >
            <div className={styles.browserWarningContent}>
                <p className={styles.browserWarningText}>
                    Hello! Finn here! You're using an unspecified browser that is not Chrome, Edge, Safari, Firefox, or Opera. For best performance, please use Chrome.
                </p>
    
            </div>
            <button className={styles.closeButton} onClick={() => {
                setIsVisible(false);
            }}>
                Close
            </button>
            </motion.div>
    }
}