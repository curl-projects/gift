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

export function ConstellationLabelPainter({ name }){
    const { triggerWarp, setTriggerWarp, constellationLabel } = useStarFireSync()
    const editor = useEditor()
    const textRef = useRef(null);
    const [animationCommenced, setAnimationCommenced] = useState(false)
    
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
                    text={constellationLabel.text}
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

    const covenantPlaceholders = [
        {
            name: "Covenant 1",
        },
        {
            name: "Covenant 2",
        },
    ]

    return (
        <div className={styles.metadataContainer}>
            {
                data.user.covenants 
                ? data.user.covenants.map((covenant, index) => (
                    <Covenant 
                        key={index}
                        covenant={covenant}

                        animationCommenced={animationCommenced}
                        constellationLabel={constellationLabel}

                        name={covenant.name}
                    />
                ))
                : <p>No covenants found</p>
            }    
        </div>
    )
}

export function CovenantTooltip({ children, tooltipText, variant }){

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
    }
    const [isHovered, setIsHovered] = useState(false)
    return(
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
    )
}

export function Covenant({ covenant, animationCommenced, constellationLabel }){
    const toWords = new ToWords();
    const [currentCount, setCurrentCount] = useState(covenant.times);

    const handleClick = () => {
        console.log('clicked')
        setCurrentCount(prevCount => (prevCount > 0 ? prevCount - 1 : covenant.times));
    };


    const covenantMap = {
        "CONNECT_TO_OWN_WORK": {
            text: 
                <span>Connect 
                    <span className={styles.covenantNumberContainer}>
                        <span className={styles.covenantNumberTracker}>
                            {englishToLepchaMap["A"]}
                        </span>
                        {toWords.convert(currentCount)}
                    </span> 
                    {currentCount === 1 ? "idea" : "ideas"} to your own work
                </span>,
            icon: "💡",
            helperComponent: <p>Connect to your own work</p>
        },
        "CONNECT_TO_FOUND_ITEM": {
            text: <span>Connect {toWords.convert(currentCount)} {currentCount === 1 ? "idea" : "ideas"} to something that you've collected in your journal</span>,
            icon: "💡",
            helperComponent: <p>Connect to your found items</p>
        },
        "CONNECT_TO_INTERESTING_PERSON": {
            text: <span>Connect {toWords.convert(currentCount)} {currentCount === 1 ? "idea" : "ideas"} to someone that will resonate with it</span>,
            icon: "💡",
            helperComponent: <p>Connect to interesting people</p>
        },
        "ATTACH_NOVEL_THOUGHT": {
            text: 
                <CovenantTooltip tooltipText={"Create a new thought"} variant={"mainClause"}>
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
                                data-style={index < currentCount ? "active" : "inactive"} 
                                style={{
                                    marginLeft: `${index * 1}em`
                                }}
                            />
                        ))}
                        Create
                    </span>
                        {currentCount === 0 ? "d" : " "} {currentCount === 0 ? toWords.convert(covenant.times) : toWords.convert(currentCount)} new 
                        <span className={styles.covenantSuperscriptContainer} style={{
                            paddingRight: "0px",
                        }}>
                            <span className={styles.covenantSuperscript} data-char={
                                currentCount === 1 
                                ? "thought".split('').map(char => englishToLepchaMap[char] || char).join('') 
                                : "thoughts".split('').map(char => englishToLepchaMap[char] || char).join('')
                                } />
                            {currentCount === 1 ? "thought" : "thoughts"}
                        </span> 
                    </span>
                </CovenantTooltip>
                ,
            icon: "💡",
            helperComponent: <p>Attach a new thought</p>
        }
    }

    return(
        <div className={styles.covenantWrapper} onClick={handleClick}>
            <p className={styles.covenantLabel}>
                {covenantMap[covenant.covenantType].text}
                {/* <LabelTranslate
                    constellationLabel={constellationLabel}
                    animationCommenced={animationCommenced}
                    text={covenantMap[covenant.covenantType].text}
                    delay={300}
                /> */}
            </p>
            {covenant.modifiers.map((modifier, index) => (
                <CovenantModifier
                    key={index}
                    modifier={modifier}
                    constellationLabel={constellationLabel}
                    animationCommenced={animationCommenced}
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

export function CovenantModifier({ modifier, constellationLabel, animationCommenced }){
    const modifierCategoryMap = {
        "AND": {
            text: "and",
        },
        "WITH": {
            text: "with",
        }
    }

    const modifierMap = {
        "JUSTIFY": {
            text: "justify the connection",
            helperComponent: <p>Justify the connection</p>
        },
        "FEWER_WORDS": {
            text: `fewer than ${modifier.params.words} words`,
            helperComponent: <p>Use fewer words</p>
        },
        "MORE_WORDS": {
            text: <span style={{ display: 'flex'}}>more than 
                    <span className={styles.covenantSuperscriptContainer}>
                        <span className={styles.covenantSuperscript} data-char={modifier.params.words} />
                        {modifier.params.words}
                    </span>
                    words
                </span>,
            helperComponent: <p>Use more words</p>
        }
    }

    return(
        <div className={styles.clauseContainer}>
            <CovenantTooltip tooltipText={"This is a tooltip"} variant={"connector"}>
                <p className={styles.clauseJoiner}>
                    {modifierCategoryMap[modifier.modifierCategory].text}
                </p>
            </CovenantTooltip>
            <CovenantTooltip tooltipText={"This is also a tooltip"} variant={"subclause"}>
                {modifierMap[modifier.modifier].text}
            </CovenantTooltip>
                {/* <LabelTranslate
                constellationLabel={constellationLabel}
                animationCommenced={animationCommenced}
                text={modifierMap[modifier.modifier].text}
                delay={600}
            /> */}
        </div>    
    )
}

export function LabelTranslate({ constellationLabel, animationCommenced, text, delay, blocked=false }){
    const textRef = useRef(null);

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
        <span ref={textRef}></span>
    )
}