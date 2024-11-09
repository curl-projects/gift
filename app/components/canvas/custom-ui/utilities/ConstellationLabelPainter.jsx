import styles from "./ConstellationLabelPainter.module.css"
import { useRef, useState, useEffect } from "react"
import { transliterateToLepcha } from "../../helpers/language-funcs"
import { useStarFireSync } from "~/components/synchronization/StarFireSync"
import { createShapeId, useEditor } from "tldraw"
import { motion } from "framer-motion"
import { TextScramble } from "~/components/canvas/custom-ui/post-processing-effects/text-scramble/TextScramble";
// import { LabelTranslate } from "~/components/canvas/custom-ui/game-ui/LabelTranslate.jsx"
import { englishToLepchaMap } from "~/components/canvas/helpers/language-funcs.js"
import { useDataContext } from "~/components/synchronization/DataContext"
import { ToWords } from 'to-words';
import { ConnectLabel } from "~/components/canvas/custom-ui/utilities/constellation-label-components/ConnectLabel"
import { JustifyLabel } from "~/components/canvas/custom-ui/utilities/constellation-label-components/JustifyLabel"

import { ConstellationLabelSuperscript } from "~/components/canvas/custom-ui/utilities/constellation-label-components/ConstellationLabelSuperscript.jsx"
import { ConstellationLabelTooltip } from "~/components/canvas/custom-ui/utilities/constellation-label-components/ConstellationLabelTooltip.jsx"
import { useCovenantContext } from "~/components/synchronization/CovenantContext"
import * as BABYLON from '@babylonjs/core';

export function ConstellationLabelPainter({ name }){
    const { triggerWarp, setTriggerWarp, constellationLabel, focusOnComponent } = useStarFireSync()
    const editor = useEditor()
    const textRef = useRef(null);
    const { data } = useDataContext();
    const [animationCommenced, setAnimationCommenced] = useState(false)
    const { setCampfireView } = useStarFireSync()
    const { allCompleted } = useCovenantContext()


    function handleNameClick(){
        if(allCompleted){
            setCampfireView({
                active: true,
                immediate: false,
                useTargetPosition: true,
                targetPosition: new BABYLON.Vector3(0.17, -3.25, 4.22),
        })
    }
    }
    
    return(
        <motion.div 
            className={styles.labelWrapper}
            initial={{ opacity: 0 }}
            animate={{ opacity: constellationLabel.visible ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ 
                duration: constellationLabel.immediate ? 0 : (constellationLabel.duration || 1),
                delay: constellationLabel.delay || 0,
            }}
            style={{
                pointerEvents: constellationLabel.visible ? 'all' : 'none',
                filter: focusOnComponent.active && focusOnComponent.component !== 'label' ? `opacity(${focusOnComponent.opacity})` : 'none'
            }}
            // onAnimationStart = {() => {
            //     console.log('started')
            //     setTimeout(()=>{
            //         setAnimationCommenced(true)
            //     }, 7000)
            // }}
            onAnimationComplete={(animation) => {
                // manual text scramble delay

                if(constellationLabel.visible && animation.opacity === 1){
                    setTimeout(()=>{
                        setAnimationCommenced(true)

                        setTimeout(()=>{
                            constellationLabel.onComplete && constellationLabel.onComplete()
                        }, 3000)
                    }, 1000)
                    
                }
                else if(animation.opacity === 0){
                    constellationLabel.onComplete && constellationLabel.onComplete()
                }
            }
            }
            >
            <motion.p className={styles.constellationGlyph}>
                <LabelTranslate 
                    constellationLabel={constellationLabel} 
                    animationCommenced={animationCommenced}
                    text={data.user.name}
                    onClick={handleNameClick}
                />
            </motion.p>
            <ConstellationCovenants animationCommenced={animationCommenced} constellationLabel={constellationLabel}/>
        </motion.div>
    )
}

export function ConstellationCovenants({ animationCommenced, constellationLabel }){
    const { data } = useDataContext();
    
    useEffect(()=>{
        console.log('LABEL DATA:', data)
    }, [data])
    
    return (
        <div className={styles.covenantsContainer}>
            {
                data.user.covenants 
                ? data.user.covenants.map((covenant, index) => (
                    <Covenant 
                        key={index}
                        covenant={covenant}
                    />
                ))
                : <p>No covenants found</p>
            }    
        </div>
    )
}

// export function CovenantTooltip({ children, tooltipText, variant }){

//     const variants = {
//         'mainClause': {
//             underlineColor: "rgba(231, 229, 237, 1)",
//         },
//         'connector': {
//             underlineColor: "#EB5757",
//         },
//         'subclause': {
//             underlineColor: "rgb(201, 198, 213)",
//         }
//     }
//     const [isHovered, setIsHovered] = useState(false)
//     return(
//         <span 
//         className={styles.tooltipContainer}
//         onMouseEnter={() => setIsHovered(true)}
//         onMouseLeave={() => setIsHovered(false)}
//     >
//         <span className={styles.textWithUnderline}>
//             {children}
//             <span 
//                 className={`${styles.underline} ${isHovered ? styles.underlineActive : ''}`} 
//                 style={{ backgroundColor: variants[variant].underlineColor }}
//             ></span>
//         </span>
//         {isHovered && (
//             <span className={styles.tooltipBox}>
//                 {tooltipText}
//             </span>
//         )}
//     </span>
//     )
// }

export function CovenantMainClause({ covenant }){
    const toWords = new ToWords();

    const covenantMap = {
        "CONNECT_TO_OWN_WORK": {
            text: <ConnectLabel covenant={covenant} />,
            icon: "💡",
            helperComponent: <p>Connect to your own work</p>
        },
        "CONNECT_TO_FOUND_ITEM": {
            text: <span>Connect an idea to something that you've collected in your journal</span>,
            icon: "💡",
            helperComponent: <p>Connect to your found items</p>
        },
        "CONNECT_TO_INTERESTING_PERSON": {
            text: <span>Connect an idea to someone that will resonate with it</span>,
            icon: "💡",
            helperComponent: <p>Connect to interesting people</p>
        },
        "ATTACH_NOVEL_THOUGHT": {
            text: <span>Attach novel thought </span>,
            icon: "💡",
            helperComponent: <p>Attach a new thought</p>
        }
    }
    return(
        <p className={styles.covenantLabel}>
            {covenantMap[covenant.covenantType].text}
        </p>
    )
}

export function Covenant({ covenant }){
    return(
        <div className={styles.covenantWrapper}>
            <CovenantMainClause covenant={covenant} />
            {covenant.modifiers.map((modifier, index) => (
                <CovenantModifier
                    key={index}
                    modifier={modifier}
                />
            ))
        }
        </div>
    )
}

{/* <p className={styles.constellationMetadataValue}>
<LabelTranslate
constellationLabel={constellationLabel}
animationCommenced={animationCommenced}
text="Finn"
delay={600}
blocked={true}
/>
</p> */}

export function CovenantConjunction({ modifier }){
    const modifierCategoryMap = {
        "AND": {
            text: "and",
        },
        "WITH": {
            text: "with",
        }
    }
    return(
        <ConstellationLabelTooltip tooltipText={"This is a tooltip"} variant={"connector"}>
            <span className={styles.clauseJoiner}>
                {modifierCategoryMap[modifier.modifierCategory].text}
            </span>
        </ConstellationLabelTooltip> 
    )
}

export function CovenantClause({ modifier }){
    const modifierMap = {
        "JUSTIFY": {
            text: <JustifyLabel modifier={modifier} />,
            tooltipText: "Justify the connection"
        },
        "FEWER_WORDS": {
            text: `fewer than ${modifier.params ? modifier.params.words : 0} words`,
            tooltipText: <p>Use fewer words</p>
        },
        "MORE_WORDS": {
            text: <span style={{ display: 'flex', alignItems: 'flex-end'}}>more than 
                    <span className={styles.covenantSuperscriptContainer}>
                        <span className={styles.covenantSuperscript} data-char={modifier.params ? modifier.params.words : 0} />
                        {modifier.params ? modifier.params.words : 0}
                    </span>
                    <span style={{ whiteSpace: 'nowrap'}}>words</span>
                </span>,
            helperComponent: <p>Use more words</p>
        }
    }

    return(
        <ConstellationLabelTooltip tooltipText={"This is also a tooltip"} variant={"subclause"}>
            {modifierMap[modifier.modifier].text}
        </ConstellationLabelTooltip>
    )
}

export function CovenantModifier({ modifier }){
    return(
        <p className={styles.clauseContainer}>
            <CovenantConjunction modifier={modifier} />
            <CovenantClause modifier={modifier} />
        </p>    
    )
}

export function LabelTranslate({ constellationLabel, animationCommenced, text, delay, blocked=false, onClick=() => {}}){
    const textRef = useRef(null);
    const { allCompleted } = useCovenantContext()

    useEffect(() => {
        if (constellationLabel.visible && textRef.current) {
           
            // Initialize with scrambled text
            const scrambledText = text.split('').map(char => englishToLepchaMap[char] || char).join('');
            textRef.current.innerHTML = scrambledText;
        }
    }, [constellationLabel.visible]);

    useEffect(()=>{
        if(constellationLabel.visible && text && animationCommenced && !blocked){
            console.log("outer triggered")
            setTimeout(() => {
                console.log('triggered')
                const fx = new TextScramble(textRef.current, styles.dud, true); // use lepcha instead
                    fx.setText(text)
            }, delay || 0)
        }
    }, [constellationLabel.visible, text, animationCommenced])



    return(
        <span 
            ref={textRef}
            onClick={onClick}
            style={{
            textShadow: allCompleted ? "0 0 10px white, 0 0 20px white, 0 0 30px white, 0 0 40px white" : "none",
            }}
        >
        </span>
    )
}