import { useState, useEffect } from "react"
import { ConstellationLabelSuperscript } from "~/components/canvas/custom-ui/utilities/constellation-label-components/ConstellationLabelSuperscript.jsx"
import { englishToLepchaMap } from "~/components/canvas/helpers/language-funcs.js"
import { useCovenantContext } from "~/components/synchronization/CovenantContext"
import styles from "~/components/canvas/custom-ui/utilities/ConstellationLabelPainter.module.css"

export function JustifyLabel({ modifier }){
    const { calculateCompletionPercentage, calculateActiveChars } = useCovenantContext()
    const completionPercentage = calculateCompletionPercentage("modifier", modifier.id)
    const activeCharsCount = calculateActiveChars("modifier", modifier.modifier, completionPercentage)

    useEffect(() => {
        console.log("JUSTIFY COMPLETION PERCENTAGE", completionPercentage)
        console.log("JUSTIFY ACTIVE CHARS COUNT", activeCharsCount)
    }, [completionPercentage, activeCharsCount])

    return(
        <span>
            <ConstellationLabelSuperscript
                modifier={modifier}
                // textData={completionPercentage === 100 ? Array.from("justified") : Array.from("justify")}
                textData={Array.from("justify")}
                charMapper={(item, index) => englishToLepchaMap[item] || item}
                styleMapper={(item, index, styles, activeCharsCount) => index < activeCharsCount ? styles.active : styles.inactive}
                styleMapperArgs={[activeCharsCount]}
                superscriptStyles={(index) => ({
                    position: 'relative',
                    left: `${index * 0.7}em`,
                    // index === 0 ? '-6px' : `${-9 + index * 11}px`,
                })}
                rightSpace
                
            >
                {completionPercentage === 100 ? "justified" : "justify"}
            </ConstellationLabelSuperscript>
            the connection
        </span>
    )
}