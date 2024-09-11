import styles from './Pitch.module.css'
import journalStyles from "~/components/canvas/shapes/journal-shape/JournalShapeUtil.module.css"
import { InkBleed } from "~/components/canvas/custom-ui/post-processing-effects/InkBleed"

export function Pitch(){
    return(
    <div className={styles.pitchLayout}>
        <InkBleed
            initialBlur={4}
            delay={0}
            duration={0.5}>
                <h1 className={journalStyles.journalLargeText}>Pitch</h1>
        </InkBleed>
    </div>
    )
}