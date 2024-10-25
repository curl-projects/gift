import styles from './GoalPainter.module.css'
import { motion } from 'framer-motion'

export function GoalPainter(){
    return(
        <div className={styles.goal}>
               <motion.svg
                width="100"
                height="100"
                viewBox="-20 -20 120 120"
                className={styles.innerIcon}
                >
                    <motion.path
                        d="M50 10 L90 50 L50 90 L10 50 Z"
                        stroke="rgba(255, 255, 255, 0.7)"
                        strokeWidth="20px"
                        fill="transparent"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{
                            duration: 1,
                            ease: "easeInOut",
                            delay: 4,
                        }}
                    />
            </motion.svg>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                    duration: 1,
                    delay: 4.5
                }}
            >
                Make a new friend
            </motion.p>
        </div>
    )
}