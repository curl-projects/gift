import styles from './Clouds.module.css';

export function Clouds() {
    return (
        <>
            <div className={styles.cloudsOverlay}></div>
            <div className={`${styles.cloudsOverlay} ${styles.cloudsOverlayReverse}`}></div>
        </>
    );
}