import { useState, useEffect } from "react"
import { englishToLepchaMap } from "~/components/canvas/helpers/language-funcs.js"
import styles from "~/components/canvas/custom-ui/utilities/ConstellationLabelPainter.module.css"
import { CovenantTooltip } from "~/components/canvas/custom-ui/utilities/ConstellationLabelPainter.jsx"
import { ToWords } from 'to-words';
import { useCovenantContext } from "~/components/synchronization/CovenantContext"

export function ConnectLabel({ currentCount, covenant }){
    const { covenantCompletion, setCovenantCompletion } = useCovenantContext()
    const [activeCharsCount, setActiveCharsCount] = useState(0)
    const toWords = new ToWords();

    useEffect(()=>{
        const completionPercentage = covenantCompletion.find(covenant => covenant.id === covenant.id).completionPercentage
        const totalChars = currentCount === 1 || covenant.times === 1 ? "idea".length : "ideas".length;
        const activeCharsCount = Math.ceil((completionPercentage / 100) * totalChars);
        setActiveCharsCount(activeCharsCount)
        console.log("ACTIVE CHARS COUNT:", activeCharsCount)
    }, [covenantCompletion, currentCount])
    

    return(
        <CovenantTooltip tooltipText={"Connect to your own work"} variant={"mainClause"}>
        <span style={{ display: 'flex'}}>
        <span 
            className={styles.covenantSuperscriptContainer} 
            style={{ 
                paddingLeft: "0px",
                paddingRight: currentCount === 0 ? "0px" : "0.6em"
            }}> 
            {Array.from({ length: covenant.times }).map((_, index) => (
                <span
                    key={index} 
                    className={styles.covenantSuperscript} 
                    data-char={englishToLepchaMap[String.fromCharCode(65 + index)]} 
                    data-style={index < currentCount ? "inactive" : "active"} 
                    style={{
                        marginLeft: `${index * 1}em`
                    }}
                />
            ))}
            Connect
        </span>
            {currentCount === 0 ? "ed" : " "} {currentCount === 0 ? toWords.convert(covenant.times) : toWords.convert(currentCount)} 
            <span className={styles.covenantSuperscriptContainer} style={{
            }}>
                {Array.from(currentCount === 1 || covenant.times === 1 ? "idea" : "ideas").map((char, index) => (
                    <span 
                        key={index} 
                        className={`${styles.covenantSuperscript}`} 
                        data-char={englishToLepchaMap[char] || char} 
                        data-style={index < activeCharsCount ? "active" : "inactive"} 
                        style={{
                            position: 'relative',
                            left: index === 0 ? '-6px' : `${-9 + index * 11}px`, // Apply left only to characters after the first
                            // textShadow: index < 2 ? "0 0 5px rgba(255, 255, 255, 0.8), 0 0 10px rgba(255, 255, 255, 0.6), 0 0 15px rgba(255, 255, 255, 0.4)" : "inherit",
                            // color: index < 2 ? "white" : "inherit"
                        }}
                    />
                ))}
                {/* <span 
                    className={styles.covenantSuperscript} 
                    data-char={
                        currentCount === 1 || covenant.times === 1
                        ? "idea".split('').map(char => englishToLepchaMap[char] || char).join('') 
                        : "ideas".split('').map(char => englishToLepchaMap[char] || char).join('')
                        } 
                /> */}
                {(currentCount === 1 || covenant.times === 1 ) ? "idea" : "ideas"} to your own work
            </span> 
            </span>
        </CovenantTooltip>  
    )
}