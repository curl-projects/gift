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
		databaseId: string
	}
>

const OneLiner = Node.create({
	name: "oneLiner",
	topNode: true,
	content: "block",
  });

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
        // useEffect(()=>{
        //     if(isOnlySelected){
        //         this.editor.zoomToBounds(this.editor.getShapePageBounds(shape), {
        //             animation: {
        //                 duration: 200
        //             },
        //             targetZoom: 1,
        //         })
        //     }
		// 	else{
		// 	}
        // }, [isOnlySelected])

		// const shapeRef = useRef<HTMLDivElement>(null);
		// const horizontalBuffer = 6
		// const verticalBuffer = 2

		// const editor = useEditor({
		// 	extensions: [
		// 	  OneLiner,
		// 	  Text,
        //       Paragraph,
		// 	  Placeholder.configure({
		// 		placeholder: "Unknown Excerpt"
		// 	  })
		// 	],
		// 	content: shape.props.text,
		

		// 	onUpdate: ({ editor }) => {
		// 		stopEventPropagation;

		// 		shapeRef.current && this.editor.updateShape<ExcerptShape>({
		// 			id: shape.id,
		// 			type: 'excerpt',
		// 			props: {
		// 				text: editor.getJSON(),
		// 				plainText: editor.getText(),
		// 				w: shapeRef.current?.clientWidth+horizontalBuffer,
		// 				h: shapeRef.current?.clientHeight+verticalBuffer,
		// 			}
		// 		})
		// 	},

		// 	onSelectionUpdate: ({ editor }) => {
		// 	}
		//   });


		// useEffect(()=>{
		// 	if(editor && this.editor && shapeRef.current){
		// 		this.editor.updateShape<ExcerptShape>({
		// 			id: shape.id,
		// 			type: 'excerpt',
		// 			props: {
		// 				w: shapeRef.current?.clientWidth+horizontalBuffer,
        //                 h: shapeRef.current?.clientHeight+verticalBuffer,
		// 			}
		// 		})
		// 	}
		//   }, [this.editor, editor, shapeRef.current])

		return (
			<HTMLContainer 
				id={shape.id}
				className={styles.container}
				>
				<div className={styles.shapeContent}>
					<div className={styles.editorContent}>
						<p>{shape.props.plainText}</p>
					</div>
				</div>
			</HTMLContainer>
		)
	}


	indicator(shape: ExcerptShape) {
		return <rect width={shape.props.w} height={shape.props.h} />

	}
}