import {
	BaseBoxShapeUtil,
	Geometry2d,
	Rectangle2d,
	TLBaseShape,
	useValue,
	HTMLContainer,
	stopEventPropagation,
	TLOnTranslateStartHandler,
	TLOnTranslateEndHandler,
} from '@tldraw/editor'
import { T, createShapeId } from 'tldraw';
import { useCallback, useState, useEffect, useRef, useLayoutEffect } from 'react'
import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { Node } from "@tiptap/core";
import Placeholder from '@tiptap/extension-placeholder'
import styles from './ConceptShapeUtil.module.css'; // Import the CSS module

const conceptShapeProps = {
	w: T.number,
	h: T.number,
	text: T.any,
	plainText: T.any,
	activated: T.boolean,
	description: T.any,
	// temporary: T.boolean,
	// colors: T.array,
}

type ConceptShape = TLBaseShape<
	'concept',
	{
		w: number
		h: number
		text: any,
		plainText: any,
		activated: boolean,
		// temporary: boolean,
		// colors: any,
		description: any,
	}
>

const OneLiner = Node.create({
	name: "oneLiner",
	topNode: true,
	content: "block",
  });

/** @public */
export class ConceptShapeUtil extends BaseBoxShapeUtil<ConceptShape> {
	static override type = 'concept' as const
	static override props = conceptShapeProps

	override canEdit = () => true

	override canResize = () => false


	getDefaultProps(): ConceptShape['props'] {
		return { 
			w: 100,
			h: 20,
			text: "",
			plainText: "",
			activated: false,
			// temporary: false,
			// colors: [conceptColors[Math.floor(Math.random() * conceptColors.length)]],
			description: "No description",
		}
	
	}

	getGeometry(shape: ConceptShape): Geometry2d {
		return new Rectangle2d({
			width: shape.props.w,
			height: shape.props.h,
			isFilled: true,
		})
	}

	component(shape: ConceptShape) {
		const shapeRef = useRef<HTMLDivElement>(null);
		const buffer = 4

		const editor = useEditor({
			extensions: [
			  OneLiner,
			  Paragraph,
			  Text,
			  Placeholder.configure({
				placeholder: "Unknown Concept"
			  })
			],
			content: shape.props.text,
		

			onUpdate: ({ editor }) => {
				stopEventPropagation;

				this.editor.updateShape<ConceptShape>({
					id: shape.id,
					type: 'concept',
					props: {
						text: editor.getJSON(),
						plainText: editor.getText(),
						w: shapeRef.current?.clientWidth ? (shapeRef.current?.clientWidth+buffer) : 100,
						h: shapeRef.current?.clientHeight ? (shapeRef.current?.clientHeight+buffer) : 20,
					}
				})
			},
		  });


		useLayoutEffect(()=>{
			if(editor && this.editor){
				this.editor.updateShape<ConceptShape>({
					id: shape.id,
					type: 'concept',
					props: {
						w: shapeRef.current?.clientWidth ? (shapeRef.current?.clientWidth+buffer) : 100,
						h: shapeRef.current?.clientHeight ? (shapeRef.current?.clientHeight+buffer) : 20,
					}
				})
			}
		  }, [this.editor, editor])

	
		const [isHovered, setIsHovered] = useState(false)

		return (
			<HTMLContainer 
				id={shape.id}
				className={styles.container} // Apply the CSS module class
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
				>
					
				{
				isHovered &&  shape.props.description && (
					<div className={styles.hoverDescription}>
						{shape.props.description}
					</div>
				)}
				<div className={styles.shapeContent} ref={shapeRef}>
					<div className={styles.shapeCircle} />
					<EditorContent 
						editor={editor}
						onKeyDown={stopEventPropagation}
						className={styles.editorContent}
					/>
				</div>
			</HTMLContainer>
		)
	}


	indicator(shape: ConceptShape) {
		return <rect width={shape.props.w} height={shape.props.h} />

	}

	override onTranslateStart: TLOnTranslateStartHandler<ConceptShape> = (shape) => {
	}

	override onTranslateEnd: TLOnTranslateEndHandler<ConceptShape> = (shape) => {
		}

}