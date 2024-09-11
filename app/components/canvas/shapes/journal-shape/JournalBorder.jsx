import styles from './JournalBorder.module.css';
import { useEffect } from 'react';

export function JournalBorder({ borderThickness, distance, borderVisibility }){

    useEffect(()=>{
        console.log("BORDER VISIBILITY", borderVisibility)
    }, [borderVisibility])
    return(
        <div className={styles.journalBorder} style={{
            top: `${distance}px`,
            left: `${distance}px`,
            right: `${distance}px`,
            bottom: `${distance}px`,

            borderBottom: borderVisibility.bottom ? `${borderThickness}px solid rgba(80, 74, 68, 0.5)` : 'none',
            borderLeft: borderVisibility.left ? `${borderThickness}px solid rgba(80, 74, 68, 0.5)` : 'none',
            borderRight: borderVisibility.right ? `${borderThickness}px solid rgba(80, 74, 68, 0.5)` : 'none',
            borderTop: borderVisibility.top ? `${borderThickness}px solid rgba(80, 74, 68, 0.5)` : 'none',
        }}/>
    )
}
