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

const excerptShapeProps = {
	w: T.number,
	h: T.number,
	text: T.any,
	plainText: T.any,
	activated: T.boolean,
	description: T.any,
	temporary: T.boolean,
	databaseId: T.string,
	// colors: T.array,
	mediaMode: T.boolean,
}

type ExcerptShape = TLBaseShape<
	'excerpt',
	{
		w: number
		h: number
		text: any,
		plainText: any,
		activated: boolean,
		temporary: boolean,
		// colors: any,
		description: any,
		databaseId: string,
		mediaMode: boolean,
	}
>

/** @public */
export class ExcerptShapeUtil extends BaseBoxShapeUtil<ExcerptShape> {
	static override type = 'excerpt' as const
	static override props = excerptShapeProps

	override canEdit = () => true

	override canResize = () => false


	getDefaultProps(): ExcerptShape['props'] {
		return { 
			w: 200,
			h: 20,
			text: "",
			plainText: "",
			activated: false,
			temporary: false,
			// colors: [conceptColors[Math.floor(Math.random() * conceptColors.length)]],
			description: "No description",
			databaseId: "no-id",
			mediaMode: false,
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
		const isOnlySelected = this.editor.getOnlySelectedShapeId() === shape.id;
		const [scope, animate] = useAnimate(); // Use animation controls
	
		console.log("SHAPE VALS:", shape.props.w, shape.props.h)

		useEffect(()=>{
			if(shapeRef.current){
				this.editor.updateShape({id: shape.id, type: shape.type, props: {
					w: shapeRef.current.clientWidth,
					h: shapeRef.current.clientHeight
				}})
			}
		}, [this.editor, shapeRef.current, isOnlySelected])
		

        useEffect(() => {
			const animateHeight = async () => {
				if (isOnlySelected && scope.current) {
					this.editor.updateShape({
						id: shape.id,
						type: shape.type,
						props: {
							w: shapeRef.current.clientWidth,
							h: 820
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
						transition: { duration: 0.1, ease: "easeInOut" }
					});

					await this.editor.updateShape({
						id: shape.id,
						type: shape.type,
						props: {
							w: shapeRef.current.clientWidth,
							h: shapeRef.current.clientHeight
						}
					});
					
					// this.editor.zoomToBounds(this.editor.getShapePageBounds(shape), {
					// 	animation: {
					// 		duration: 300
					// 	},
					// 	targetZoom: 3,
					// });
				} else {
					await animate(scope.current, {
						height: "0px",
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

			animateHeight();
		}, [isOnlySelected, scope]);



		return (
			<HTMLContainer 
				id={shape.id}
				className={styles.container}
				>
				<div  className={styles.excerptBox} ref={shapeRef}>
					<p className={styles.excerptText}><span className={styles.connectionPoint}/>
					{shape.props.plainText}
					</p>
					<div
						ref={scope}
						className={styles.excerptMediaBox} 
						style={{
							height: "0px",
							border: "2px solid pink",
						}}

					/>
				</div>
			</HTMLContainer>
		)
	}


	indicator(shape: ExcerptShape) {
		return <rect width={shape.props.w} height={shape.props.h} />

	}
}