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
import { EditorContent, useEditor } from '@tiptap/react';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { Node } from "@tiptap/core";
import Placeholder from '@tiptap/extension-placeholder'
import styles from './ExcerptShapeUtil.module.css';
import { motion, useAnimate } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { useLoaderData } from "@remix-run/react"
import ExcerptMediaEditor from './ExcerptMediaEditor';
import { updateThreadBindingProps } from '~/components/canvas/bindings/thread-binding/ThreadBindingUtil';

const excerptShapeProps = {
	w: T.number,
	h: T.number,
	content: T.string,
	databaseId: T.string,
	media: T.any,
	expanded: T.boolean,
}

type ExcerptShape = TLBaseShape<
	'excerpt',
	{
		w: number,
		h: number,
		content: string,
		databaseId: string,
		media: any,
		expanded: boolean,
	}
>

/** @public */
export class ExcerptShapeUtil extends BaseBoxShapeUtil<ExcerptShape> {
	static override type = 'excerpt' as const
	static override props = excerptShapeProps

	override canEdit = () => true
	override canScroll = () => true;

	override canResize = () => false;

	override hideSelectionBoundsBg = () => true;
	override hideSelectionBoundsFg = () => true;

	getDefaultProps(): ExcerptShape['props'] {
		return {
			w: 300,
			h: 20,
			content: "",
			databaseId: "no-id",
			media: null,
			expanded: false,
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
		const data = useLoaderData();
		const isOnlySelected = this.editor.getOnlySelectedShapeId() === shape.id;
		const [scope, animate] = useAnimate(); // Use animation controls

		useEffect(()=>{
			if(isOnlySelected || this.editor.getShape(this.editor.getOnlySelectedShapeId())?.type === 'annotation'){
				this.editor.updateShape({
					id: shape.id,
					type: shape.type,
					props: {
						expanded: true
					}
				})
			}
			else{
				this.editor.updateShape({
					id: shape.id,
					type: shape.type,
					props: {
						expanded: false
					}
				})
			}
		}, [isOnlySelected])

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
                // Update thread binding props
                updateThreadBindingProps(this.editor, shape.id);

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
			const animateDimensions = async () => {
				if (shape.props.expanded && scope.current) {
					this.editor.updateShape({
						id: shape.id,
						type: shape.type,
						props: {
							w: 600,
							h: 840
						}
					});

					this.editor.zoomToBounds(this.editor.getShapePageBounds(shape), {
						animation: {
							duration: 300
						},
						targetZoom: 3,
					});

					await animate(scope.current, {
						height: "800px",
						maxHeight: "800px",
						width: '600px',
						maxWidth: '600px',
						transition: { duration: 0.1, ease: "easeInOut" }
					});

					await animate(shapeRef.current, {
						width: "600px",
						maxWidth: "600px",
						transition: { duration: 0.1, ease: "easeInOut" }
					});

					this.editor.updateShape({
						id: shape.id,
						type: shape.type,
						props: {
							w: shapeRef.current.clientWidth,
							h: shapeRef.current.clientHeight
						}
					});
				} else {
					// Set initial width before starting the animation
					shapeRef.current.style.width = "300px";
					shapeRef.current.style.maxWidth = "300px";

					await animate(scope.current, {
						height: "0px",
						width: '300px',
						maxWidth: '300px',
						transition: { duration: 0.3, ease: "easeInOut" }
					});

					await animate(shapeRef.current, {
						width: "300px",
						maxWidth: "300px",
						transition: { duration: 0.3, ease: "easeInOut" }
					});

					this.editor.updateShape({
						id: shape.id,
						type: shape.type,
						props: {
							w: shapeRef.current.clientWidth,
							h: shapeRef.current.clientHeight
						}
					});
				}
			};

			animateDimensions();
		}, [shape.props.expanded, scope]);



   	const dashedRingVariants = {
        hidden: { scale: 0, rotate: 0, x: "-50%", y: "-50%" },
        visible: {
            scale: 1.5, // Adjust scale as needed
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
		

		return (
			<HTMLContainer
				id={shape.id}
				className={styles.container}
				style={{
					pointerEvents: 'all',
				}}
			>
				<div 
					className={styles.excerptBox}
					ref={shapeRef}>
					<p className={styles.excerptText} style={{
						minWidth: '300px',
						cursor: "pointer",
					}}>
						<motion.span
							className={styles.connectionPoint}
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ delay: 1, duration: 0.2, ease: 'easeInOut' }}
						>
						   {this.editor.getOnlySelectedShapeId() === shape.id && (
								<motion.div
									className={styles.dashedRing}
									initial="hidden"
									animate={["visible", "rotate"]}
									exit="exit"
									variants={dashedRingVariants}
								/>
		                    )}
						</motion.span>
						<span className='excerptTextContent'>{shape.props.content}</span>
					</p>
					<div
						ref={scope}
						className={styles.excerptMediaBox}
						style={{
							height: "0px",
							padding: shape.props.expanded ? "20px" : "0px"
						}}
						onScrollCapture={(e) => {
							e.stopPropagation();
						}}
						onWheelCapture={(e) => {
							e.stopPropagation();
						}}
						onDrag={(e) => {
							e.stopPropagation();
						}}
						onPointerDown={(e) => {
							e.stopPropagation();
						}}
					>
						{(shape.props.expanded && scope.current) &&
							<ExcerptMediaEditor
								excerpt={shape}
								tldrawEditor={this.editor}
								annotations={data.user.concepts.flatMap(concept => concept.excerpts).find(excerpt => excerpt.id === shape.props.databaseId)?.media.annotations || []}
							/>
						}
					</div>
				</div>
			</HTMLContainer>
		)
	}


	indicator(shape: ExcerptShape) {
		return null;
	}
}