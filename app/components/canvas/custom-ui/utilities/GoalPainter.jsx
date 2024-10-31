import styles from './GoalPainter.module.css'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useStarFireSync } from '~/components/synchronization/StarFireSync'

export function GoalPainter(){
    const { focusOnComponent } = useStarFireSync()
    const [isFilled, setIsFilled] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    const toggleComplete = () => {
        setIsFilled(!isFilled);
        setIsComplete(!isComplete);
    };

    return(
        <div 
            className={styles.goal}
            onClick={toggleComplete}
            style={{
                filter: (focusOnComponent.active && focusOnComponent.component !== 'goal') ? `opacity(${focusOnComponent.opacity})` : 'none'
            }}
            >
               <motion.svg
                width="100"
                height="100"
                viewBox="-20 -20 120 120"
                className={styles.innerIcon}
                >
                    <motion.path
                        d="M50 10 L90 50 L50 90 L10 50 Z"
                        stroke={isComplete ? "rgba(255, 255, 255, 0.7)" : "rgba(255, 255, 255, 1)"}
                        strokeWidth="20px"
                        fill={isFilled ? "rgba(255, 255, 255, 0.7)" : "transparent"}
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{
                            duration: 1,
                            ease: "easeInOut",
                            delay: 0.4,
                        }}
                    />
            </motion.svg>
            <div className={styles.textContainer}>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                        duration: 1,
                        delay: 0.5,
                    }}
                    style={{ color: isComplete ? "rgba(255, 255, 255, 0.7)" : "inherit"}}
                >
                    Make a new friend
                </motion.p>
                {isComplete && (
                    <motion.div
                        className={styles.strikethrough}
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 0.5 }}
                    />
                )}
            </div>
        </div>
    )
}
