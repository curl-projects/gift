import React from 'react';
import styles from './ConstellationLabelSuperscript.module.css'; // Assuming you have a CSS module for styling
import { englishToLepchaMap } from "~/components/canvas/helpers/language-funcs.js"

export function ConstellationLabelSuperscript({ children, times, currentCount,
    textData, charMapper, styleMapper,
    containerStyles, superscriptStyles, leftSpace, rightSpace
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
            {textData(currentCount, times).map((item, index) => (
                <span
                    key={index}
                    className={styles.covenantSuperscript}
                    data-char={charMapper ? charMapper(item, index) : englishToLepchaMap[item] || item}
                    data-style={styleMapper ? styleMapper(item, index, currentCount) : (index < currentCount ? "inactive" : "active")}
                    style={{
                        // marginLeft: `${index * 1}em`,
                        ...(typeof superscriptStyles === 'function' ? superscriptStyles(index) : superscriptStyles),
                    }}
                />
            ))}
            {children}
        </span>

    );
}