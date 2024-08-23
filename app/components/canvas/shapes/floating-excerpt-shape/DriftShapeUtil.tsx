import {
	BaseBoxShapeUtil,
	Geometry2d,
	Rectangle2d,
	TLBaseShape,
	HTMLContainer,
	stopEventPropagation,
} from '@tldraw/editor'

import { T, createShapeId } from 'tldraw';
import { useLoaderData } from '@remix-run/react';
import { useCallback, useState, useEffect, useRef, useLayoutEffect, useMemo } from 'react'
import styles from './DriftShapeUtil.module.css';
import { motion, useAnimate, AnimatePresence, useAnimationControls } from 'framer-motion';
// import { generateExcerpts, tearDownExcerpts, excerptsExist } from "~/components/canvas/helpers/thread-funcs"
// import { applyProgressiveBlur, removeProgressiveBlur } from '~/components/canvas/helpers/distribution-funcs';
// import { updateThreadBindingProps } from '~/components/canvas/bindings/thread-binding/ThreadBindingUtil';

const driftShapeProps = {
	w: T.number,
	h: T.number,
	type: T.string,
	text: T.string,
	triggerDelete: T.boolean,
}

type DriftShape = TLBaseShape<
	'drift',
	{
		w: number
		h: number
		type: string,
		text: string,
		triggerDelete: boolean
	}
>

/** @public */
export class DriftShapeUtil extends BaseBoxShapeUtil<DriftShape> {
	static override type = 'drift' as const
	static override props = driftShapeProps

	// override canEdit = () => false
	// override canResize = () => false
    // override hideSelectionBoundsBg = () => true
    // override hideSelectionBoundsFg = () => true;

	getDefaultProps(): DriftShape['props'] {
		return { 
			w: 200,
			h: 56,
			type: "excerpt",
			text: "",
			triggerDelete: false,
		}
	}

	getGeometry(shape: DriftShape): Geometry2d {
		return new Rectangle2d({
			width: shape.props.w,
			height: shape.props.h,
			isFilled: true,
		})
	}

	component(shape: DriftShape) {
		const bounds = this.editor.getShapeGeometry(shape).bounds
		const data: any = useLoaderData();
		const [isHovered, setIsHovered] = useState(false)
		const shapeRef = useRef<HTMLDivElement>(null);
		const controls = useAnimationControls()
		const [scope, animate] = useAnimate();

		useEffect(() => {
			if (shape.props.triggerDelete) {
				controls.start("hidden").then(()=>{
					console.log("DELETING DRIFT")
					this.editor.deleteShape(shape.id);
				})
				
                // animate(shapeRef.current, { opacity: 0 }, { duration: 1 }).then(() => {
				// 	console.log("DELETING HAPE")
                //     this.editor.deleteShape(shape.id);
                // });
			}
        }, [shape.props.triggerDelete]);

        useEffect(() => {
            const handleResize = () => {
              if (shapeRef.current?.clientHeight) {
                this.editor.updateShape({
                  type: shape.type,
                  id: shape.id,
                  props: {
                    w: shapeRef.current.clientWidth,
                    h: shapeRef.current.clientHeight
                  }
                });
              }
            };
        
            const resizeObserver = new ResizeObserver(handleResize);
            if (shapeRef.current) {
              resizeObserver.observe(shapeRef.current);
            }
        
            return () => {
              if (shapeRef.current) {
                resizeObserver.unobserve(shapeRef.current);
              }
              resizeObserver.disconnect();
            };
          }, [shapeRef.current, this.editor, shape]);

	
		  const variants = {
			hidden: { opacity: 0 },
			visible: { opacity: 1 }
		};

		const rippleVariants = {
			hidden: { opacity: 0, x: "-50%", y: "-50%" },
			visible: { opacity: 0, x: "-50%", y: "-50%" } 
		}

		useEffect(()=>{
			controls.start("visible")
			animate(`.ripple`, { scale: [1, 3], opacity: [0, 1, 0], x: "-50%", y: "-50%" }, { duration: 8, ease: "easeOut" });

		}, [])
	

		return (
			<div 
				id={shape.id}
				className={styles.container}	
				ref={scope}			
				>
				<div 
                    className={styles.shapeContent} 
                    ref={shapeRef} 
                    style={{
                        cursor: 'pointer',
                        }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    >
					<motion.p
					key={shape.id} // Use shape.id as a stable and unique key
					className={styles.editorContent} 
					variants={variants}
					initial="hidden"
					animate={controls}
					exit="hidden"
					transition={{ delay: 0, duration: 2, ease: 'easeInOut' }}
					>
						{shape.props.text}
					</motion.p>
					<motion.div 
						initial="hidden"
						animate="hidden"
						className={`${styles.ripple} ripple`}
						style={{
							height: shapeRef.current?.clientWidth,
							width: shapeRef.current?.clientWidth
						}}
						variants={rippleVariants}
						// transition={{ delay: 0}}
					>
					</motion.div>
				</div>
			</div>
		)
	}

	indicator(shape: DriftShape) {
        return null
		// return <rect width={shape.props.w} height={shape.props.h} />

	}
}