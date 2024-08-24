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
import styles from './AnnotationShapeUtil.module.css';
import { motion, useAnimate, AnimatePresence, useAnimationControls } from 'framer-motion';
import { useConstellationMode } from '~/components/canvas/custom-ui/utilities/ConstellationModeContext';

const annotationShapeProps = {
	w: T.number,
	h: T.number,
	type: T.string,
	text: T.string,
	temporary: T.boolean,
}

type AnnotationShape = TLBaseShape<
	'annotation',
	{
		w: number
		h: number
		type: string,
		text: string,
		temporary: boolean,
	}
>

/** @public */
export class AnnotationShapeUtil extends BaseBoxShapeUtil<AnnotationShape> {
	static override type = 'annotation' as const
	static override props = annotationShapeProps

	override canEdit = () => false
	override canResize = () => false
    override hideSelectionBoundsBg = () => false
    override hideSelectionBoundsFg = () => false;

	getDefaultProps(): AnnotationShape['props'] {
		return { 
			w: 200,
			h: 56,
			type: "comment",
			text: "No Text",
			temporary: true,
		}
	}

	getGeometry(shape: AnnotationShape): Geometry2d {
		return new Rectangle2d({
			width: shape.props.w,
			height: shape.props.h,
			isFilled: true,
		})
	}

	component(shape: AnnotationShape) {
		const bounds = this.editor.getShapeGeometry(shape).bounds
		const data: any = useLoaderData();
		const [isHovered, setIsHovered] = useState(false)
		const shapeRef = useRef<HTMLDivElement>(null);
		const controls = useAnimationControls()
		const [scope, animate] = useAnimate();
		const { annotationing, setAnnotationing, setExpandedShapeIds } = useConstellationMode();

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
                    >
                    <p style={{
						fontSize: "50px",
						color: "orange",
						fontWeight: '800',
					}}>
                        {shape.props.text}
                    </p>
				</div>
			</div>
		)
	}

	indicator(shape: AnnotationShape) {
        return null
		// return <rect width={shape.props.w} height={shape.props.h} />

	}
}