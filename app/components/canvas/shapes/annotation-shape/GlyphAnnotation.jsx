import styles from './AnnotationShapeUtil.module.css'
import { InkBleed } from '~/components/canvas/custom-ui/post-processing-effects/InkBleed'

export function GlyphAnnotation({
    shape,
    data,
    animate,
    shapeRef,
    isOnlySelected,
    tldrawEditor,
    fetcher,
}){


    return(
        <div 
            className={styles.shapeContentGlyph} 
            ref={shapeRef} 
            style={{
                cursor: 'pointer',
                }}
            >
            <InkBleed 
                initialBlur={4}
                delay={0}
                duration={1}>
                <div className={styles.glyphContainer}>
                    <p className={styles.glyph}>{shape.props.glyph}</p>
                </div>
            </InkBleed>
        </div>
    )
}