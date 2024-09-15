import styles from "./ConstellationLabel.module.css"
import { useRef, useEffect } from "react"
import { englishToLepchaMap } from "~/components/canvas/helpers/language-funcs.js"
import { TextScramble } from "~/components/canvas/custom-ui/post-processing-effects/text-scramble/TextScramble";

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