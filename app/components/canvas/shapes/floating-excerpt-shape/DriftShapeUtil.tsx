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
import { motion, useAnimate, AnimatePresence } from 'framer-motion';
// import { generateExcerpts, tearDownExcerpts, excerptsExist } from "~/components/canvas/helpers/thread-funcs"
// import { applyProgressiveBlur, removeProgressiveBlur } from '~/components/canvas/helpers/distribution-funcs';
// import { updateThreadBindingProps } from '~/components/canvas/bindings/thread-binding/ThreadBindingUtil';

const driftShapeProps = {
	w: T.number,
	h: T.number,
	type: T.string,
	text: T.string,
	selfDestructTime: T.number,
}

type DriftShape = TLBaseShape<
	'drift',
	{
		w: number
		h: number
		type: string,
		text: string,
		selfDestructTime: number,
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
			selfDestructTime: 10000,
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
        const [scope, animate] = useAnimate();
		const bounds = this.editor.getShapeGeometry(shape).bounds
		const data: any = useLoaderData();
		const [isHovered, setIsHovered] = useState(false)

		const shapeRef = useRef<HTMLDivElement>(null);

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

	
		  useEffect(() => {
            const timer = setTimeout(() => {
                this.editor.deleteShape(shape.id);
            }, shape.props.selfDestructTime-200);

            return () => clearTimeout(timer);
        }, [shape.props.selfDestructTime]);

		return (
			<HTMLContainer 
				id={shape.id}
				className={styles.container}				
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
                    className={styles.editorContent} 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ delay: 2, duration: 1, ease: 'easeInOut' }}
                >
                    {shape.props.text}
                </motion.p>
				</div>
			</HTMLContainer>
		)
	}

	indicator(shape: DriftShape) {
        return null
		// return <rect width={shape.props.w} height={shape.props.h} />

	}
}