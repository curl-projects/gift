import {
	BaseBoxShapeUtil,
	Geometry2d,
	Rectangle2d,
	TLBaseShape,
	HTMLContainer,
	stopEventPropagation,
} from '@tldraw/editor'

import { T, createShapeId } from 'tldraw';
import { useDataContext } from '~/components/synchronization/DataContext';

import { useCallback, useState, useEffect, useRef, useLayoutEffect, useMemo } from 'react'
import { EditorContent, useEditor } from '@tiptap/react';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { Node } from "@tiptap/core";
import Placeholder from '@tiptap/extension-placeholder'
import styles from './ConceptShapeUtil.module.css';
import { motion, useAnimate, AnimatePresence, useAnimation } from 'framer-motion';
import { generateExcerpts, tearDownExcerpts, excerptsExist } from "~/components/canvas/helpers/thread-funcs"
import { applyProgressiveBlur, removeProgressiveBlur } from '~/components/canvas/helpers/distribution-funcs';
import { updateThreadBindingProps } from '~/components/canvas/bindings/thread-binding/ThreadBindingUtil';
import { useConstellationMode } from '~/components/canvas/custom-ui/utilities/ConstellationModeContext';
import { ConceptStar } from './ConceptStar';
import { useStarFireSync } from '~/components/synchronization/StarFireSync';
import { animateShapeProperties } from "~/components/canvas/helpers/animation-funcs"

const conceptShapeProps = {
	w: T.number,
	h: T.number,
	text: T.any,
	plainText: T.any,
	description: T.any,
    databaseId: T.string,
    expanded: T.boolean,
}

type ConceptShape = TLBaseShape<
	'concept',
	{
		w: number
		h: number
		text: any,
		plainText: any,
		description: any,
        databaseId: string,
        expanded: boolean,
	}
>

/** @public */
export class ConceptShapeUtil extends BaseBoxShapeUtil<ConceptShape> {
	static override type = 'concept' as const
	static override props = conceptShapeProps

	override canEdit = () => false
	override canResize = () => false
    override hideSelectionBoundsBg = () => true
    override hideSelectionBoundsFg = () => true;

	getDefaultProps(): ConceptShape['props'] {
		return { 
			w: 200,
			h: 56,
			text: "",
			plainText: "",
			description: "No description",
            expanded: false,
            databaseId: 'no-id',
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
		const {data } = useDataContext();
        const { expandExcerpts } = useConstellationMode();
        const [pulseTrigger, setPulseTrigger] = useState(0);
        const { entries, setEntries, setJournalMode, conceptList, setConceptList, setDrifting, conceptIsDragging, setConceptIsDragging } = useStarFireSync()

		const shapeRef = useRef<HTMLDivElement>(null);

        useEffect(()=>{
            console.log("CONCEPT POSITIONS:", shape)
        }, []);

    
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
                // updateThreadBindingProps(this.editor, shape.id);
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

	
		const [isHovered, setIsHovered] = useState(false)
		const isDragging = useRef(false);
    
        const selectedShapeIds = this.editor.getSelectedShapeIds();
        const memoizedSelectedShapeIds = useMemo(() => selectedShapeIds, [selectedShapeIds]);



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
						setPulseTrigger(prev => prev + 1)

                        console.log("IS NOT DRAGGING", isDragging.current)


						if(!conceptList.active){
							setConceptList({
								active: true,
							focusedConcept: shape.id
						})

						this.editor.updateShape({
							id: shape.id,
							type: shape.type,
							props: {
								expanded: true
							}
							})
						}
						else if(conceptList.active && conceptList.focusedConcept !== shape.id){
							console.log("CHANGING FOCUSED CONCEPT", conceptList, shape.id)
							setConceptList(prevState => ({
								...prevState, 
								focusedConcept: shape.id,
							}))
						}
						else if(conceptList.active && conceptList.focusedConcept === shape.id){
							console.log("CLOSING CONCEPT LIST")
							setConceptList(prevState => ({
								...prevState, 
								focusedConcept: null
							}))
							setDrifting({active: true })
						}


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
			[shape.id, setConceptIsDragging]
		);

		const controls = useAnimation();

		useEffect(() => {
            console.log("DISSOLVE", conceptIsDragging, shape.id)
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
                            type: "concept",
                            id: shape.id,
                            title: shape.props.plainText,
                            content: shape.props.description,
                            author: data.user.name, // todo: this will need to be updated when the data model's complete
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
			<HTMLContainer 
				id={shape.id}
				className={styles.container}		
                style={{
                    transform: conceptList.active ? 'scale(var(--tl-scale))' : 'initial', 
                }}>
					
				<motion.div
					animate={controls}
				>
					{
					isHovered && shape.props.description && (
						<motion.div 
							className={styles.hoverDescription}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.3, ease: "linear" }}
							style={{ 
								transform: conceptList.active ? 'translateX(0%)' : 'translateX(-50%)', 
								overflow: 'hidden',
								left: conceptList.active ? '100%' : '50%',
								bottom: conceptList.active ? '50%' : '120%',
							}}
						>
							<p>
								{shape.props.description}
							</p>
						</motion.div>
					)}

					<div 
                        className={styles.shapeContent} 
                        ref={shapeRef} 
                        style={{
                            cursor: 'pointer',
                            maxHeight: conceptList.active ? "30px" : "unset"
                            }}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        onMouseDown={handleMouseDown}
                        >
                    <ConceptStar 
                        selected={(this.editor.getOnlySelectedShapeId() === shape.id) || (conceptList.focusedConcept === shape.id)}
                        pulseTrigger={pulseTrigger}
                        collapsed={conceptList.active}
                    />
                        <motion.p 
                            className={styles.editorContent} 
                            initial={{ opacity: 0 }} 
                            style={{
                                position: "relative",
                                left: conceptList.active ? -16 : 0
                            }}
                            animate={{ 
                                opacity: conceptList.active && (conceptList.focusedConcept !== shape.id && !isHovered)  ? 0.5 : 0.8,
                            }} 
                            transition={{ 
                                delay: 2, 
                                duration: 1, 
                                ease: 'easeInOut', 
                                fontSize: { duration: 0.3, ease: 'easeInOut' },
                                opacity: { duration: 0.3, ease: 'easeInOut' },
                            }}
                        >
                            {shape.props.plainText}
                        </motion.p>
					</div>
				</motion.div>
			</HTMLContainer>
		)
	}

	indicator(shape: ConceptShape) {
        return null
		// return <rect width={shape.props.w} height={shape.props.h} />

	}
}