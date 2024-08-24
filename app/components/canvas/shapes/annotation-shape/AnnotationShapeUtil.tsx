import {
	BaseBoxShapeUtil,
	Geometry2d,
	Rectangle2d,
	TLBaseShape,
	HTMLContainer,
	stopEventPropagation,
} from '@tldraw/editor'

import { T, createShapeId } from 'tldraw';
import { useLoaderData, useFetcher } from '@remix-run/react';
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
	from: T.number,
	to: T.number,
}

type AnnotationShape = TLBaseShape<
	'annotation',
	{
		w: number
		h: number
		type: string,
		text: string,
		temporary: boolean,
		from: number,
		to: number,
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
			from: 0,
			to: 10,
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
		const fetcher = useFetcher({ key: 'annotation-fetcher'});

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
					{shape.props.temporary &&
						<button 
							style={{
								fontSize: "50px",
								color: "blue",
								fontWeight: '800',
								cursor: 'pointer',
							}}
							onPointerDown={async () => {
								console.log("POINTER DOWN ON NEW ANNOTATION")
								const mediaBinding = this.editor.getBindingsFromShape(shape.id, 'annotation').find(binding => {
									console.log("BINDING:", this.editor.getShape(binding.toId), this.editor.getShape(binding.toId).type === 'excerpt')
									return this.editor.getShape(binding.toId).type === 'excerpt'
								})

								// save annotation to database
								if (mediaBinding) {
									// fetcher.submit(
									// 	{
									// 		actionType: "saveAnnotation",
									// 		mediaId: mediaBinding.toId,
									// 		content: shape.props.text,
									// 		fromPos: shape.props.from,
									// 		toPos: shape.props.to,
									// 	},
									// 	{ method: "post", action: "/world-models.$person" }
									// );
								}

								console.log("MEDIA BINDING", mediaBinding)

								// add highlight
								this.editor.updateShape({
									id: mediaBinding.toId,
									type: "excerpt",
									props: {
											
									}
								})

							}}>
							Highlight
						</button>
					}
				</div>
			</div>
		)
	}

	indicator(shape: AnnotationShape) {
        return null
		// return <rect width={shape.props.w} height={shape.props.h} />

	}
}