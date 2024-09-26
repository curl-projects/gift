import styles from './MobileStarlight.module.css';
import { Stars } from '~/components/canvas/custom-ui/aesthetics/stars/Stars';
import { Clouds } from '~/components/canvas/custom-ui/aesthetics/clouds/Clouds';

export function MobileStarlight(){
    return(
        <>
            <div>
                <p className={styles.mobileStarlightText}>Starlight only works on desktop for now</p>
            </div>
            <Clouds absoluteMode />
            <Stars absoluteMode />
        </>
    )
}