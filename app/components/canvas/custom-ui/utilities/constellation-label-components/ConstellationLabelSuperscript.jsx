import { useEffect } from 'react';
import styles from './ConstellationLabelSuperscript.module.css'; // Assuming you have a CSS module for styling
import { englishToLepchaMap } from "~/components/canvas/helpers/language-funcs.js"

export function ConstellationLabelSuperscript({ children, covenant,
    textData, charMapper, styleMapper, styleMapperArgs = [], // Add a prop for dynamic arguments
    containerStyles, leftSpace, rightSpace
}) {
    return (
        <span
            className={styles.covenantSuperscriptContainer}
            style={{
                paddingLeft: leftSpace ? "0.6em" : "0px",
                paddingRight: rightSpace ? "0.6em" : "0px",
    
                ...containerStyles,
            }}
        >
            <span className={styles.covenantSuperscript}>
                {textData && (typeof textData === 'number' ? (
                    <span
                     className={styles.covenantSuperscriptText} style={{
                        position: 'relative',
                        left: "7px",
                    }}>
                        {textData}
                    </span>
                ) : (
                    textData.map((item, index) => (
                        <span
                            key={index}
                            className={`${styles.covenantSuperscriptText} ${styleMapper(item, index, styles, ...styleMapperArgs)}`}
                            style={{
                                position: 'relative',
                                left: leftSpace ? `0.6em` : "0px",
                            }}
                        >
                            {charMapper ? charMapper(item, index) : englishToLepchaMap[item] || item}
                        </span>
                    ))
                ))}
        </span>
            {children}
            
        </span>
    

    );
}