import { useState, useEffect } from "react"
import { ConstellationLabelSuperscript } from "~/components/canvas/custom-ui/utilities/constellation-label-components/ConstellationLabelSuperscript.jsx"
import { englishToLepchaMap } from "~/components/canvas/helpers/language-funcs.js"

export function JustifyLabel({ currentCount, modifier }){
    return(
        <span>
            <ConstellationLabelSuperscript
                modifier={modifier}
                currentCount={0}
                textData={(currentCount, modifier) =>
                    Array.from(currentCount === 0 ? "justified" : "justify")
                }
                charMapper={(item, index) => englishToLepchaMap[item] || item}
                styleMapper={(item, index, currentCount) => index > currentCount ? "inactive" : "active"}
                styleMapperArgs={[currentCount]} // Pass currentCount as an argument
                superscriptStyles={(index) => ({
                    position: 'relative',
                    left: `${index * 0.7}em`,
                    // index === 0 ? '-6px' : `${-9 + index * 11}px`,
                })}
                rightSpace
                
            >
                {currentCount === 0 ? "justified" : "justify"}
            </ConstellationLabelSuperscript>
            the connection
        </span>
    )
}