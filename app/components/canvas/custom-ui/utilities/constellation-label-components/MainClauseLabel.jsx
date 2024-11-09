import { useState, useEffect } from "react"
import { englishToLepchaMap } from "~/components/canvas/helpers/language-funcs.js"
import styles from "~/components/canvas/custom-ui/utilities/ConstellationLabelPainter.module.css"
// import { CovenantTooltip } from "~/components/canvas/custom-ui/utilities/ConstellationLabelPainter.jsx"
import { ToWords } from 'to-words';
import { useCovenantContext } from "~/components/synchronization/CovenantContext"
import { useCardState } from "~/components/canvas/shapes/journal-shape/journal-covenants/CardStateContext"

import { ConstellationLabelSuperscript } from "~/components/canvas/custom-ui/utilities/constellation-label-components/ConstellationLabelSuperscript.jsx"
import { ConstellationLabelTooltip } from "~/components/canvas/custom-ui/utilities/constellation-label-components/ConstellationLabelTooltip.jsx"
import { mainClauseMapping } from "~/components/synchronization/CovenantContext.jsx"

export function MainClauseLabel({ covenant, preScriptIncomplete, preScriptCompleted, postScript }) {
    const { calculateCompletionPercentage, calculateActiveChars } = useCovenantContext()
    const completionPercentage = calculateCompletionPercentage("mainClause", covenant.id)
    const activeCharsCount = calculateActiveChars("mainClause", covenant.covenantType, completionPercentage)

    useEffect(()=>{
        console.log("COMPLETION PERCENTAGE", completionPercentage)
        console.log("ACTIVE CHARS COUNT", activeCharsCount)
    }, [activeCharsCount])

    return (
        <span>
            <ConstellationLabelTooltip tooltipText={"Main clause tooltip"} variant="mainClause">
            {completionPercentage === 100 ? preScriptCompleted : preScriptIncomplete}
            <ConstellationLabelSuperscript
                covenant={covenant}
                textData={Array.from(mainClauseMapping[covenant.covenantType])}
                charMapper={(item, index) => englishToLepchaMap[item] || item}
                styleMapper={(item, index, styles, activeCharsCount) => {
                    return index < activeCharsCount ? styles.active : styles.inactive
                }}
                styleMapperArgs={[activeCharsCount]} // Pass activeCharsCount as an argument
                leftSpace
                rightSpace={postScript ? true : false}
            >
                {mainClauseMapping[covenant.covenantType]}
            </ConstellationLabelSuperscript>
                {postScript}
            </ConstellationLabelTooltip>
        </span>
    )
}