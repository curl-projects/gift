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
import { motion, useAnimate, useAnimationControls } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { useDataContext } from '~/components/synchronization/DataContext';
import ExcerptMediaEditor from './ExcerptMediaEditor';
import { updateThreadBindingProps } from '~/components/canvas/bindings/thread-binding/ThreadBindingUtil';
import { useStarFireSync } from '~/components/synchronization/StarFireSync';

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
		const controls = useAnimationControls();
		const [isDragging, setIsDragging] = useState(false);
		const { setJournalMode } = useStarFireSync();

		const excerpt = data.user.concepts.flatMap(concept => concept.excerpts).find(excerpt => excerpt.id === shape.props.databaseId) || null

		const rippleVariants = {
			hidden: { opacity: 0, x: "-50%", y: "-50%" },
			visible: { opacity: 0, x: "-50%", y: "-50%" } 
		};

		useEffect(() => {
			controls.start("visible");
			animate(`.ripple`, { scale: [1, 3], opacity: [0, 1, 0], x: "-50%", y: "-50%" }, { duration: 8, ease: "easeOut" });
		}, []);

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


		  const handleMouseDown = (e: React.MouseEvent) => {
			setIsDragging(false);
			const startX = e.clientX;
			const startY = e.clientY;

			const handleMouseMove = (moveEvent: MouseEvent) => {
				if (Math.abs(moveEvent.clientX - startX) > 5 || Math.abs(moveEvent.clientY - startY) > 5) {
					setIsDragging(true);
				}
			};

			const handleMouseUp = (upEvent: MouseEvent) => {
				if (!isDragging) {
					setJournalMode({ active: true, variant: 'modern', page: 'article', content: shape.props.media?.content || "", position: 'right' })
				}
				document.removeEventListener('mousemove', handleMouseMove);
				document.removeEventListener('mouseup', handleMouseUp);
			};

			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mouseup', handleMouseUp);
		};


		return (
			<div
				id={shape.id}
				className={styles.container}
				ref={scope}
				style={{
					pointerEvents: 'all',
				}}
				onMouseDown={handleMouseDown}>
				<div 
				className={styles.excerptBox}
				ref={shapeRef}>
					<motion.p 
						className={styles.excerptTitle}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 1, delay: 0, ease: "easeInOut" }}
					>{excerpt?.media?.title || "Untitled"}</motion.p>
					<motion.p className={styles.excerptAuthor}
						initial={{ opacity: 0}}
						animate={{ opacity: 1 }}
						transition={{ duration: 1, delay: 0, ease: "easeInOut" }}
					>{excerpt?.media?.user?.name || "Unknown"} · {excerpt?.media?.date?.toLocaleDateString() || "No Date"}</motion.p>
					<motion.p
						className={styles.excerptText}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 1, delay: 0, ease: "easeInOut" }}
						style={{
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
					</motion.p>
					<motion.div 
						initial="hidden"
						animate="hidden"
						className={`${styles.ripple} ripple`}
						style={{
							height: shapeRef.current?.clientWidth,
							width: shapeRef.current?.clientWidth
						}}
						variants={rippleVariants}
					>
					</motion.div>
				</div>
			</div>
		)
	}


	indicator(shape: ExcerptShape) {
		return null;
	}


	
}