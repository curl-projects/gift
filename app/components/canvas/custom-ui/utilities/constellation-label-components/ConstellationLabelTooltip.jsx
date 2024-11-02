import { useState, useEffect } from "react";
import styles from "./ConstellationLabelTooltip.module.css";
import { motion } from "framer-motion";
export function ConstellationLabelTooltip({ children, tooltipText, variant, leftSpace, rightSpace }) {
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        console.log("isHOVERED", isHovered);
    }, [isHovered]);

    const variants = {
        'mainClause': {
            underlineColor: "rgba(231, 229, 237, 1)",
        },
        'connector': {
            underlineColor: "#EB5757",
        },
        'subclause': {
            underlineColor: "rgb(201, 198, 213)",
        }
    };

    return (
        <span
            className={styles.tooltipContainer}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                paddingLeft: leftSpace ? "0.6em" : "0px",
                paddingRight: rightSpace ? "0.6em" : "0px",
            }}
        >
            <span className={styles.textWithUnderline}>
                {children}
                <span
                    className={`${styles.underline} ${isHovered ? styles.underlineActive : ''}`}
                    style={{ backgroundColor: variants[variant].underlineColor }}
                ></span>
            </span>
            
            {isHovered && (
                <motion.span 
                    className={styles.tooltipBox}
                    style={{
                        border: `2px solid ${variants[variant].underlineColor}`,
                    }}
                    initial={{ opacity: 0, y: 10, x: "-50%" }}
                    animate={{ opacity: 1, y: 0, x: "-50%" }}
                    exit={{ opacity: 0, y: 10, x: "-50%" }}
                    transition={{ duration: 0.3 }}
                >
                    {tooltipText}
                </motion.span>
            )}
        </span>
    );
}
