import styles from "./ConstellationLabel.module.css"
import { useRef, useState, useEffect } from "react"
import { transliterateToLepcha } from "../../helpers/language-funcs"
import { useStarFireSync } from "~/components/synchronization/StarFireSync"
import { createShapeId, useEditor } from "tldraw"
import { motion } from "framer-motion"
import { TextScramble } from "~/components/canvas/custom-ui/post-processing-effects/text-scramble/TextScramble";
import { englishToLepchaMap } from "~/components/canvas/helpers/language-funcs.js"
import { LabelTranslate } from "~/components/canvas/custom-ui/game-ui/LabelTranslate.jsx"

export function ConstellationLabel({ name }){
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
            // onAnimationStart = {() => {
            //     console.log('started')
            //     setTimeout(()=>{
            //         setAnimationCommenced(true)
            //     }, 7000)
            // }}
            onAnimationComplete={(animation) => {
                // manual text scramble delay
                console.log("animation", animation)
                if(animation && animation.opacity === 1){
                    
                }
                if(constellationLabel.visible && animation.opacity === 1){
                    setTimeout(()=>{
                        setAnimationCommenced(true)

                        setTimeout(()=>{
                            constellationLabel.onComplete && constellationLabel.onComplete()
                        }, 3000)
                    }, 1000)
                    
                }
                else if(!constellationLabel.visible && animation.opacity === 0){
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
            <div className={styles.metadataRow}>
                <div className={styles.constellationMetadataWrapper}>
                    <p className={styles.constellationMetadataLabel}>
                        <LabelTranslate 
                            constellationLabel={constellationLabel} 
                            animationCommenced={animationCommenced} 
                            text="Discoverer"
                            delay={300}
                        />
                    </p>
                    <p className={styles.constellationMetadataValue}>
                        <LabelTranslate 
                            constellationLabel={constellationLabel} 
                            animationCommenced={animationCommenced} 
                            text={name}
                            delay={600}
                            blocked={true}
                        />
                    </p>
                </div>
                <div className={styles.constellationMetadataWrapper}>
                    <p className={styles.constellationMetadataLabel}>
                        <LabelTranslate 
                            constellationLabel={constellationLabel} 
                            animationCommenced={animationCommenced} 
                            text="Exploration Status"
                            delay={300}
                        />
                    </p>
                    <p className={styles.constellationMetadataValue}>
                        <LabelTranslate 
                            constellationLabel={constellationLabel} 
                            animationCommenced={animationCommenced} 
                            text="3 Remaining"
                            delay={600}
                            blocked={true}
                        />
                    </p>
                </div>
            </div>
        </motion.div>
    )
}