import styles from './Cover.module.css';
import journalStyles from "~/components/canvas/shapes/journal-shape/JournalShapeUtil.module.css"
import { InkBleed } from "~/components/canvas/custom-ui/post-processing-effects/InkBleed"


export function Cover(){
    return(
        <div className={styles.coverLayout}>
            <InkBleed
                initialBlur={4}
                delay={0}
                duration={0.5}>
                    <h1 className={journalStyles.journalLargeText}>Cover</h1>
            </InkBleed>
        </div>
    )
}