import styles from "./ConstellationLabel.module.css"
export function ConstellationLabel({ name }){
    return(
        <div className={styles.labelWrapper}>
            <p className={styles.constellationName}>{name}'s Constellation</p>
        </div>
    )
}