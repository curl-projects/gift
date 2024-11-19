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
import { useDataContext } from '~/components/synchronization/DataContext';
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
		const { data } = useDataContext();
		const isOnlySelected = this.editor.getOnlySelectedShapeId() === shape.id;
		const selectedShapeIds = this.editor.getSelectedShapeIds();
		const [scope, animate] = useAnimate(); // Use animation controls
		const [scrollChange, setScrollChange] = useState(null)

		const excerpt = data.user.concepts.flatMap(concept => concept.excerpts).find(excerpt => excerpt.id === shape.props.databaseId) || null

		useEffect(()=>{
			console.log("EXCERPT:", excerpt)
		}, [excerpt])


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
					<p className={styles.excerptTitle}>{excerpt?.media?.title || "Untitled"}</p>
					<p className={styles.excerptAuthor}>{excerpt?.media?.user?.name || "Unknown"} · {excerpt?.media?.date?.toLocaleDateString() || "No Date"}</p>
					<p className={styles.excerptText} style={{
						minWidth: '300px',
						cursor: "pointer",
					}}>
						{/* <motion.span
							className={styles.connectionPoint}
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ delay: 1, duration: 0.2, ease: 'easeInOut' }}
						>
						   {this.editor.getOnlySelectedShapeId() === shape.id && (
								<motion.span
									className={styles.dashedRing}
									initial="hidden"
									animate={["visible", "rotate"]}
									exit="exit"
									variants={dashedRingVariants}
								/>
		                    )}
						</motion.span> */}
						<span className='excerptTextContent'>
							...{shape.props.content.charAt(0).toLowerCase() + shape.props.content.slice(1)}...
						</span>
					</p>
					{/* <div
						ref={scope}
						className={styles.excerptMediaBox}
						style={{
							height: "0px",
							padding: shape.props.expanded ? "20px" : "0px"
						}}
						onScrollCapture={(e) => {
							console.log("E:", e)
							setScrollChange(e.target.scrollTop)
							console.log("SCROLL CAPTURE", e.target.scrollTop);

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
						{/* {(shape.props.expanded && scope.current) &&
							<ExcerptMediaEditor
								excerpt={shape}
								tldrawEditor={this.editor}
								annotations={data.user.concepts.flatMap(concept => concept.excerpts).find(excerpt => excerpt.id === shape.props.databaseId)?.media.annotations || []}
								shapeRef={shapeRef}
								scrollChange={scrollChange}
							/>
						}
					</div> */}
				</div>
			</HTMLContainer>
		)
	}


	indicator(shape: ExcerptShape) {
		return null;
	}


	
}