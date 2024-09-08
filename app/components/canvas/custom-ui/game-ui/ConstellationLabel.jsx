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
                    <button 
                        onPointerUp={() => {
                            document.body.style.pointerEvents = 'auto';
                            document.body.style.overflow = 'unset';
                            console.log("GIVING CONTROL BACK")
                        }}
                        style={{
                            border: '2px solid green',
                            height: "40px",
                            width: '200px',
                            background: 'green',
                            color: "white",
                        }}
                    >
                        Give Control to Campfire
                    </button>
                </div>
            </div>
        </div>
    )
}