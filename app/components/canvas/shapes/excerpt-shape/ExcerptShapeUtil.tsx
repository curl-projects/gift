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

const excerptShapeProps = {
	w: T.number,
	h: T.number,
	content: T.string,
	databaseId: T.string,
	media: T.any,
}

type ExcerptShape = TLBaseShape<
	'excerpt',
	{
		w: number,
		h: number,
		content: string,
		databaseId: string,
		media: any,
	}
>

/** @public */
export class ExcerptShapeUtil extends BaseBoxShapeUtil<ExcerptShape> {
	static override type = 'excerpt' as const
	static override props = excerptShapeProps

	override canEdit = () => true
	override canScroll = () => true;

	override canResize = () => false


	getDefaultProps(): ExcerptShape['props'] {
		return {
			w: 300,
			h: 20,
			content: "",
			databaseId: "no-id",
			media: null,
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

		// useEffect(() => {
		// 	if (shapeRef.current) {
		// 		this.editor.updateShape({
		// 			id: shape.id,
		// 			type: shape.type,
		// 			props: {
		// 				// w: shapeRef.current.clientWidth,
		// 				h: shapeRef.current.clientHeight
		// 			}
		// 		});
		// 	}
		// }, [this.editor, shapeRef.current, isOnlySelected]);

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
			const animateDimensions = async () => {
				if (isOnlySelected && scope.current) {
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
		}, [isOnlySelected, scope]);
		

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
					<p className={styles.excerptText}>
						<motion.span
							className={styles.connectionPoint}
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ delay: 1, duration: 0.2, ease: 'easeInOut' }}
						/>
						<TypeAnimation
							sequence={[1000, `${shape.props.content}`, () => {
								this.editor.updateShape({
									id: shape.id,
									type: shape.type,
									props: {
										w: shapeRef.current.clientWidth,
										h: shapeRef.current.clientHeight
									}
								});
							}]}
							speed={{ type: "keyStrokeDelayInMs", value: 20 }}
							cursor={false}
							repeat={0}
						/>
					</p>
					<div
						ref={scope}
						className={styles.excerptMediaBox}
						style={{
							height: "0px",
							padding: isOnlySelected ? "20px" : "0px"
						}}
						onScrollCapture={(e) => {
							console.log("SCROLL CAPTURE")
							e.stopPropagation();
						}}
						onWheelCapture={(e) => {
							console.log("WHEEL CAPTURE")
							e.stopPropagation();
						}}
					>
						{(isOnlySelected && scope.current) &&
							<ExcerptMediaEditor
								content={shape.props.content}
								media={shape.props.media}
							/>
						}
					</div>
				</div>
			</HTMLContainer>
		)
	}


	indicator(shape: ExcerptShape) {
		return <rect width={shape.props.w} height={shape.props.h} />

	}
}