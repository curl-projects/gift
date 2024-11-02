import React from 'react';
import styles from './ConstellationLabelSuperscript.module.css'; // Assuming you have a CSS module for styling
import { englishToLepchaMap } from "~/components/canvas/helpers/language-funcs.js"

export function ConstellationLabelSuperscript({ children, covenant, currentCount,
    textData, charMapper, styleMapper, styleMapperArgs = [], // Add a prop for dynamic arguments
    containerStyles, leftSpace, rightSpace
}) {

    return (
        <span
            className={styles.covenantSuperscriptContainer}
            style={{
                // paddingLeft: "0px",
                // paddingRight: resolvedCurrentCount === 0 ? "0px" : "0.6em",
                paddingLeft: leftSpace ? "0.6em" : "0px",
                paddingRight: rightSpace ? "0.6em" : "0px",
    
                ...containerStyles,
            }}
        >
            <span className={styles.covenantSuperscript}>
                {textData(currentCount, covenant).map((item, index) => (
                    <span
                        key={index}
                        className={`${styles.covenantSuperscriptText} ${styleMapper ? styleMapper(item, index, styles, ...styleMapperArgs) : (index < currentCount ? styles.inactive : styles.active)}`}
                        style={{
                            position: 'relative',
                            left: leftSpace ? `0.6em` : "0px",
                        }}
                        // data-style
                        // data-char={charMapper ? charMapper(item, index) : englishToLepchaMap[item] || item}
                        // data-style={styleMapper ? styleMapper(item, index, ...styleMapperArgs) : (index < currentCount ? "inactive" : "active")}
                        // style={{
                        //     // marginLeft: `${index * 1}em`,
                        //     ...(typeof superscriptStyles === 'function' ? superscriptStyles(index) : superscriptStyles),
                        // }}
                    >
                        {charMapper ? charMapper(item, index) : englishToLepchaMap[item] || item}
                    </span>
                ))}
        </span>
            {children}
            
        </span>
    

    );
}