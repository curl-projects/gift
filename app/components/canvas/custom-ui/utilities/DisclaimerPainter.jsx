import styles from './DisclaimerPainter.module.css'

export function DisclaimerPainter(){
    return(
        <div className={styles.disclaimer}>
            <p>If something breaks, try refreshing or view the backup
                <a 
                    className={styles.disclaimerLink}
                    href="https://drive.google.com/drive/folders/10m2ikjjGyw44GsVYDIp8tcAtGKgGONyR?usp=sharing" 
                    target="_blank">here</a>.
            </p>
        </div>
    )
}