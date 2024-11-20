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
import { ExcerptContent } from './ExcerptContent';

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
		const isDragging = useRef(false);
		const { setJournalMode, setConceptIsDragging, conceptIsDragging, setEntries } = useStarFireSync();

		const excerpt = data.user.concepts.flatMap(concept => concept.excerpts).find(excerpt => excerpt.id === shape.props.databaseId) || null

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


		  const handleMouseDown = useCallback(
			(e: React.MouseEvent) => {
				isDragging.current = false;
				const startX = e.clientX;
				const startY = e.clientY;

				console.log('START COORDS', shape.x, shape.y);

				setConceptIsDragging(prevState => ({
					...prevState,
					startCoords: { x: shape.x, y: shape.y },
				}));

				const handleMouseMove = (moveEvent: MouseEvent) => {
					if (
						Math.abs(moveEvent.clientX - startX) > 5 ||
						Math.abs(moveEvent.clientY - startY) > 5
					) {
						isDragging.current = true;

						const shapeRect = shapeRef.current?.getBoundingClientRect();
						if(
							shapeRect && 
							shapeRect.left < conceptIsDragging.minimapRect.right && 
							shapeRect.right > conceptIsDragging.minimapRect.left &&
							shapeRect.top < conceptIsDragging.minimapRect.bottom &&
							shapeRect.bottom > conceptIsDragging.minimapRect.top
						){
							console.log("DRAGGED INSIDE MINIMAP")
							setConceptIsDragging(prevState => ({
								...prevState,
								active: true,
								id: shape.id,
								overlap: true,
							}))
						}
						else{

							setConceptIsDragging(prevState => ({
								...prevState,
								active: true,
								id: shape.id,
								overlap: false,
							}))
						}
					}
				};

				const handleMouseUp = (upEvent: MouseEvent) => {
					console.log("MOUSE UP", isDragging.current)
					if (!isDragging.current) {
						// click functionality

						setJournalMode({ active: true, variant: 'modern', page: 'article', content: shape.props.media?.content || "", position: 'right' })

                        // Reset isDragging
                        isDragging.current = false;
                        setConceptIsDragging(prevState => ({
                            ...prevState,
                            active: false,
                            id: null,
                            overlap: false,
                            dissolve: false,
                        }))

					}

					else{
						console.log("DRAG EVENT!", conceptIsDragging)
						if(conceptIsDragging.minimapRect){
							console.log("DRAGGING ON MINIMAP", conceptIsDragging.minimapRect)
							const shapeRect = shapeRef.current?.getBoundingClientRect();
							if(
								shapeRect && 
								shapeRect.left < conceptIsDragging.minimapRect.right && 
								shapeRect.right > conceptIsDragging.minimapRect.left &&
								shapeRect.top < conceptIsDragging.minimapRect.bottom &&
								shapeRect.bottom > conceptIsDragging.minimapRect.top
							){
								console.log("DROPPED INSIDE MINIMAP", conceptIsDragging)

                                setConceptIsDragging(prevState => ({
                                    ...prevState,
                                    dissolve: true,
                                    id: shape.id,
                                }))
							}
							else{
                                isDragging.current = false;
                                setConceptIsDragging(prevState => ({
                                    ...prevState,
                                    active: false,
                                    id: null,
                                    overlap: false,
                                    dissolve: false,
                                }))
                            }
						}

                        // dragging gets reset in the dissolve useEffect elsewhere
				
					}

					// Clean up event listeners
					document.removeEventListener('mousemove', handleMouseMove);
					document.removeEventListener('mouseup', handleMouseUp);
				};

				document.addEventListener('mousemove', handleMouseMove);
				document.addEventListener('mouseup', handleMouseUp);
			},
			[shape.id, setConceptIsDragging, isDragging]
		);

		useEffect(() => {
			if (conceptIsDragging.dissolve && conceptIsDragging.id === shape.id) {
				controls.start({
					scale: 0.1,
					transition: { duration: 0.5, ease: "easeInOut" }
				}).then(() => {
					// Reset shape size and move back to previous position
					this.editor.updateShape({
						id: shape.id,
						type: shape.type,
						x: conceptIsDragging.startCoords.x,
						y: conceptIsDragging.startCoords.y,
					});
                    controls.start({
                        scale: 1,
                        transition: { type: "spring", stiffness: 300, damping: 20 }
                    })

                    // open the journal to the new entry
                    setJournalMode({ active: true, variant: "modern", page: 'entries'})
                    setEntries(prevState => ({
                        values: [...prevState.values, {
                            type: "article",
                            id: shape.id,
                            title: excerpt.media.title || "Untitled",
                            content: (excerpt.content.charAt(0).toLowerCase() + excerpt.content.slice(1)) || "No content available",
                            author: excerpt.media.user.name || "Unknown author",
                            date: new Date().toLocaleDateString(),
                        }],
                        prevValues: prevState.values
                    }))

                    isDragging.current = false;
					setConceptIsDragging(prevState => ({
						...prevState,
						active: false,
						id: null,
						overlap: false,
                        dissolve: false,
					}))
				});
			} else {
				controls.start({
					scale: 1,
					transition: { duration: 0.5, ease: "easeInOut" }
				});
			}
		}, [conceptIsDragging.dissolve, controls]);


		return (
			<div
				id={shape.id}
				className={styles.container}
				ref={scope}
				style={{
					pointerEvents: 'all',
				}}
				onMouseDown={handleMouseDown}>
				<motion.div animate={controls}>
					<ExcerptContent 
						shapeRef={shapeRef}
						excerpt={excerpt}
					/>
				</motion.div>
			</div>
		)
	}


	indicator(shape: ExcerptShape) {
		return null;
	}


	
}