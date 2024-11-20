import styles from './ExcerptShapeUtil.module.css'
import { motion } from 'framer-motion'

export function ExcerptContent({ shapeRef, excerpt }){


    const rippleVariants = {
        hidden: { opacity: 0, x: "-50%", y: "-50%" },
        visible: { opacity: 0, x: "-50%", y: "-50%" } 
    };

    return (
        <div 
        className={styles.excerptBox}
        ref={shapeRef}>
            <motion.p 
                className={styles.excerptTitle}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 2, ease: "easeInOut" }}
            >{excerpt?.media?.title || "Untitled"}</motion.p>
            <motion.p className={styles.excerptAuthor}
                initial={{ opacity: 0}}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 2, ease: "easeInOut" }}
            >{excerpt?.media?.user?.name || "Unknown"} · {excerpt?.media?.date?.toLocaleDateString() || "No Date"}</motion.p>
            <motion.p
                className={styles.excerptText}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0, ease: "easeInOut" }}
                style={{
                    minWidth: '300px',
                    cursor: "pointer",
            }}>
                <span>
                    ...{excerpt.content.charAt(0).toLowerCase() + excerpt.content.slice(1)}...
                </span>
            </motion.p>
            <motion.div 
                initial="hidden"
                animate="hidden"
                className={`${styles.ripple} ripple`}
                style={{
                    height: shapeRef.current?.clientWidth,
                    width: shapeRef.current?.clientWidth
                }}
                variants={rippleVariants}
            >
            </motion.div>
        </div>
    )
}


   {/* <motion.span
                    className={styles.connectionPoint}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1, duration: 0.2, ease: 'easeInOut' }}
                >
                    {this.editor.getOnlySelectedShapeId() === shape.id && (
                        <motion.span
                            className={styles.dashedRing}
                            initial="hidden"
                            animate={["visible", "rotate"]}
                            exit="exit"
                            variants={dashedRingVariants}
                        />
                    )}
                </motion.span> */}