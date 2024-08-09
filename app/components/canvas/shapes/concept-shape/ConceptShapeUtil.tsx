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
import styles from './ConceptShapeUtil.module.css';

const conceptShapeProps = {
	w: T.number,
	h: T.number,
	text: T.any,
	plainText: T.any,
	activated: T.boolean,
	description: T.any,
	temporary: T.boolean,
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
		temporary: boolean,
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

	getGeometry(shape: ConceptShape): Geometry2d {
		return new Rectangle2d({
			width: shape.props.w,
			height: shape.props.h,
			isFilled: true,
		})
	}

	component(shape: ConceptShape) {
		const bounds = this.editor.getShapeGeometry(shape).bounds
		const isSelected = shape.id === this.editor.getOnlySelectedShapeId();
		const shapeRef = useRef<HTMLDivElement>(null);
		const horizontalBuffer = 6
		const verticalBuffer = 2

		const editor = useEditor({
			extensions: [
			  OneLiner,
			  Text,
              Paragraph,
			  Placeholder.configure({
				placeholder: "Unknown Concept"
			  })
			],
			content: shape.props.text,
		

			onUpdate: ({ editor }) => {
				stopEventPropagation;

				shapeRef.current && this.editor.updateShape<ConceptShape>({
					id: shape.id,
					type: 'concept',
					props: {
						text: editor.getJSON(),
						plainText: editor.getText(),
						w: shapeRef.current?.clientWidth+horizontalBuffer,
						h: shapeRef.current?.clientHeight+verticalBuffer,
					}
				})
			},

			onSelectionUpdate: ({ editor }) => {
			}
		  });


		useEffect(()=>{
			if(editor && this.editor && shapeRef.current){
				this.editor.updateShape<ConceptShape>({
					id: shape.id,
					type: 'concept',
					props: {
						w: shapeRef.current?.clientWidth+horizontalBuffer,
                        h: shapeRef.current?.clientHeight+verticalBuffer,
					}
				})
			}
		  }, [this.editor, editor, shapeRef.current])

	
		const [isHovered, setIsHovered] = useState(false)

		return (
			<HTMLContainer 
				id={shape.id}
				className={styles.container}
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
					<div className={styles.circle} />
					<EditorContent 
						editor={editor}
						onKeyDown={stopEventPropagation}
						className={styles.editorContent}
                        style={{
                            border: '2px solid black'
                        }}
					/>
				</div>
			</HTMLContainer>
		)
	}


	indicator(shape: ConceptShape) {
		return <rect width={shape.props.w} height={shape.props.h} />

	}
}