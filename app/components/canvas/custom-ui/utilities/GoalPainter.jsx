import styles from './GoalPainter.module.css'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useStarFireSync } from '~/components/synchronization/StarFireSync'
import { useGoalContext } from '~/components/synchronization/GoalContext'

export function GoalPainter(){
    const { goals } = useGoalContext()

    return(
        <div className={styles.goals}>
            {goals.map((goal, index) => (
                <Goal key={index} goal={goal} />
            ))}
        </div>
    )
}

function Goal({ goal }){
    const { focusOnComponent } = useStarFireSync()
    const { setGoals } = useGoalContext()
    const [isHovered, setIsHovered] = useState(false)

    const isComplete = goal.complete

    const toggleComplete = () => {
        setGoals(prevGoals => 
            prevGoals.map(g => 
                g.title === goal.title ? { ...g, complete: !g.complete } : g
            )
        );
    };

    return(
        <div 
            className={styles.goal}
            onClick={toggleComplete}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
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
                        fill={isComplete ? "rgba(255, 255, 255, 0.7)" : "transparent"}
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
                    {goal.title}
                </motion.p>
                {isComplete && (
                    <motion.div
                        className={styles.strikethrough}
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 0.5 }}
                    />
                )}
                {isHovered && (
                    <motion.div 
                        className={styles.tooltipBox}
                        initial={{ opacity: 0, y: 10, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: 10, x: "-50%" }}
                        transition={{ duration: 0.3 }}
                    >
                        {goal.tooltip}
                    </motion.div>
                )}
            </div>
        </div>
    )
}