import {
	BaseBoxShapeUtil,
	Geometry2d,
	Rectangle2d,
	TLBaseShape,
	HTMLContainer,
	stopEventPropagation,
} from '@tldraw/editor'
import { T, createShapeId } from 'tldraw';
import { useCallback, useState, useEffect, useRef, useLayoutEffect } from 'react'
import styles from './NameShapeUtil.module.css';
import { motion, useAnimate } from 'framer-motion';

const nameShapeProps = {
	w: T.number,
	h: T.number,
	name: T.string
}

type NameShape = TLBaseShape<
	'name',
	{
		w: number
		h: number
        name: string
	}
>


/** @public */
export class NameShapeUtil extends BaseBoxShapeUtil<NameShape> {
	static override type = 'name' as const
	static override props = nameShapeProps

	override canEdit = () => true

	override canResize = () => true


	getDefaultProps(): ExcerptShape['props'] {
		return { 
			w: 200,
			h: 20,
			name: "AV",
		}
	}

	getGeometry(shape: ExcerptShape): Geometry2d {
		return new Rectangle2d({
			width: shape.props.w,
			height: shape.props.h,
			isFilled: true,
		})
	}

	component(shape: ExcerptShape) {
		const shapeRef = useRef();
        const [scope, animate] = useAnimate()

        
		useEffect(()=>{
			if(shapeRef.current && shapeRef.current.clientHeight !== 0 && shapeRef.current.clientWidth !== 0){
                console.log("SCOPE CURRENT", shapeRef.current, shapeRef.current.clientWidth, shapeRef.current.clientHeight)
				this.editor.updateShape({id: shape.id, type: shape.type, props: {
					w: shapeRef.current.clientWidth,
					h: shapeRef.current.clientHeight
				}})
			}
		}, [this.editor, shapeRef.current])

        const randomDelay = 0
        const ringVariants = {
            hidden: { scale: 0, x: "-50%", y: "-50%" },
            visible: (delay = 0) => ({
                scale: 1,
                x: "-50%", 
                y: "-50%",
                transition: { duration: 0.5, ease: "easeOut", delay }
            })
        };
        
        return (
			<HTMLContainer 
				id={shape.id}
				className={styles.container}
				>
                <div className={styles.shapeContent} ref={shapeRef}>
                    <div className={styles.circleContainer} ref={scope}>
                        <motion.div
                            className={`${styles.mostOuterRing} nameCircle`}
                            initial="hidden"
                            animate="visible"
                            custom={randomDelay + 1.25} // Delay for outer ring
                            variants={ringVariants}
                        />
                        <motion.div
                            className={`${styles.outerRing} nameCircle`}
                            initial="hidden"
                            animate="visible"
                            custom={randomDelay + 1.0} // Delay for outer ring
                            variants={ringVariants}
                        />
                        <motion.div
                            className={`${styles.innerRing} nameCircle`}
                            initial="hidden"
                            animate="visible"
                            custom={randomDelay + 0.75} // Delay for inner ring
                            variants={ringVariants}
                        />
                        <motion.div
                            className={`${styles.glow} nameCircle`}
                            initial="hidden"
                            animate="visible"
                            custom={randomDelay + 0.5} // Delay for glow
                            variants={ringVariants}
                        />
                        <motion.div
                            className={`${styles.innerGlow} nameCircle`}
                            initial="hidden"
                            animate="visible"
                            custom={randomDelay + 0.25} // Delay for inner glow
                            variants={ringVariants}
                        />
                        <motion.div
                            className={`${styles.circle} nameCircle`}
                            initial="hidden"
                            animate="visible"
                            custom={randomDelay} // No delay for circle
                            variants={ringVariants}
                        />
                        <motion.div
                        initial="hidden"
                        className={`${styles.ripple} ripple`}
                        variants={ringVariants}
                        transition={{ delay: 0 }}
                    />
                    </div>  
                </div>

			</HTMLContainer>
		)
	}


	indicator(shape: ExcerptShape) {
		return <rect width={shape.props.w} height={shape.props.h} />

	}
}