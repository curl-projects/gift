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

	override canEdit = () => false
    override hideResizeHandles = () => true
    override hideRotateHandle = () => true
	override canResize = () => false

    override hideSelectionBoundsBg = () => true
    override hideSelectionBoundsFg = () => true
    


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
        const isOnlySelected = this.editor.getOnlySelectedShapeId() === shape.id;

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

        const dashedRingVariants = {
            hidden: { scale: 0, rotate: 0, x: "-50%", y: "-50%" },
            visible: {
                scale: 1.5, // Larger than the largest outer ring
                rotate: 360,
                x: "-50%",
                y: "-50%",
                transition: { duration: 1, ease: "easeOut" }
            },
            rotate: {
                rotate: [0, 360],
                transition: { repeat: Infinity, duration: 10, ease: "linear" }
            },
            exit: {
                scale: 0,
                rotate: 0,
                x: "-50%",
                y: "-50%",
                transition: { duration: 1, ease: "easeIn" }
            }
        };

        useEffect(() => {
            if (isOnlySelected) {
                this.editor.zoomToBounds(this.editor.getShapePageBounds(shape), {
                    animation: {
                        duration: 300,
                        ease: "easeInOut"
                    },
                    targetZoom: 1,
                });

                // Trigger ripple animation
                animate(".nameCircle", { scale: 0.9 }, { duration: 0.2, ease: 'easeInOut' })
                    .then(() => animate(".nameCircle", { scale: 1.1 }, { duration: 0.2, ease: 'easeInOut' }))
                    .then(() => {
                        animate(".nameCircle", { scale: 1 }, { duration: 0.2, ease: 'easeInOut' });
                        animate(`.ripple`, { scale: [0, 8], opacity: [1, 0], x: "-50%", y: "-50%" }, { duration: 1.5, ease: "easeOut", delay: 0 });
                    });
            }
        }, [isOnlySelected, animate, shape]);

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
                    {isOnlySelected && (
                        <motion.div
                            className={styles.dashedRing}
                            initial="hidden"
                            animate={["visible", "rotate"]}
                            exit="exit"
                            variants={dashedRingVariants}
                        />
                    )}
                    </div>  
                </div>

			</HTMLContainer>
		)
	}


	indicator(shape: NameShape) {
        return
		return <rect width={shape.props.w} height={shape.props.h} />

	}
}