import { useState, useEffect } from "react";
import styles from "./ConstellationLabelTooltip.module.css";

export function ConstellationLabelTooltip({ children, tooltipText, variant }) {
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
        >
            <span className={styles.textWithUnderline}>
                {children}
                <span
                    className={`${styles.underline} ${isHovered ? styles.underlineActive : ''}`}
                    style={{ backgroundColor: variants[variant].underlineColor }}
                ></span>
            </span>
            
            {isHovered && (
                <span className={styles.tooltipBox}>
                    {tooltipText}
                </span>
            )}
        </span>
    );
}
