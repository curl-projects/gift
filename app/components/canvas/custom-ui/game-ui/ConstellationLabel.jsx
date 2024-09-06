import styles from "./ConstellationLabel.module.css"
import { transliterateToLepcha } from "../../helpers/language-funcs"

export function ConstellationLabel({ name }){
    return(
        <div className={styles.labelWrapper}>
            <p className={styles.constellationName}>
                <span className={styles.constellationGlyph}>
                    [{transliterateToLepcha(name.split(' ').map(word => word[0]).join(''))}]
                </span>
            </p>
            <div className={styles.metadataRow}>
                <div className={styles.constellationMetadataWrapper}>
                    <p className={styles.constellationMetadataLabel}>Discoverer</p>
                    <p className={styles.constellationMetadataValue}>{name}</p>
                </div>
                <div className={styles.constellationMetadataWrapper}>
                    <p className={styles.constellationMetadataLabel}>Exploration Status</p>
                    <p className={styles.constellationMetadataValue}>3 Remaining</p>
                </div>
            </div>
        </div>
    )
}