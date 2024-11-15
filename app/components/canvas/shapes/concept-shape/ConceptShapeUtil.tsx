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
import { motion, useAnimate, AnimatePresence } from 'framer-motion';
import { generateExcerpts, tearDownExcerpts, excerptsExist } from "~/components/canvas/helpers/thread-funcs"
import { applyProgressiveBlur, removeProgressiveBlur } from '~/components/canvas/helpers/distribution-funcs';
import { updateThreadBindingProps } from '~/components/canvas/bindings/thread-binding/ThreadBindingUtil';
import { useConstellationMode } from '~/components/canvas/custom-ui/utilities/ConstellationModeContext';
import { ConceptStar } from './ConceptStar';

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

		const shapeRef = useRef<HTMLDivElement>(null);


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

	
		const [isHovered, setIsHovered] = useState(false)

    
        const selectedShapeIds = this.editor.getSelectedShapeIds();
        const memoizedSelectedShapeIds = useMemo(() => selectedShapeIds, [selectedShapeIds]);

        useEffect(() => {
            
            // only do anything if the shape itself is selected
            const concept = data.user.concepts.find(concept => shape.props.databaseId === concept.id);
            const excerptIds = concept.excerpts.map(excerpt => createShapeId(excerpt.id));

            // trigger if the concept or its excerpts are selected
            if(memoizedSelectedShapeIds.length === 1 && 
                (memoizedSelectedShapeIds.includes(shape.id) ||
                 excerptIds.some(id => memoizedSelectedShapeIds.includes(id)) ||
                this.editor.getShape(memoizedSelectedShapeIds[0])?.type === 'annotation'
                )
            ){
                // if the concept is selected and its excerpts don't exist, create its excerpts
                if(memoizedSelectedShapeIds.includes(shape.id)){
                    // zoom to the concept
                    this.editor.zoomToBounds(this.editor.getShapePageBounds(shape), {
                        animation: {
                            duration: 400
                        },
                        targetZoom: 1,
                    })

                    this.editor.updateShape({
                        id: shape.id,
                        type: shape.type,
                        props: {
                            expanded: true
                        }
                    })
                }
                else if(excerptIds.some(id => memoizedSelectedShapeIds.includes(id))){
                    // excerpt was clicked, shape handles its own logic
                }
                else if(this.editor.getShape(memoizedSelectedShapeIds[0])?.type === 'annotation'){
                    // annotation was clicked, shape handles its own logic
                }
                else{
                    console.warn("Something weird was selected", memoizedSelectedShapeIds)
                }
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
        }, [memoizedSelectedShapeIds]);

        useEffect(()=>{
            const concept = data.user.concepts.find(concept => shape.props.databaseId === concept.id);
            const excerptIds = concept.excerpts.map(excerpt => createShapeId(excerpt.id));
            
            if(shape.props.expanded){
                // Trigger ripple animation
                setPulseTrigger(prev => prev + 1)

                // Create excerpts if they don't exist
                if(!excerptsExist(this.editor, concept)){
                    generateExcerpts(this.editor, concept);
                    // applyProgressiveBlur(this.editor, shape, [...excerptIds, createShapeId(data.user.uniqueName)]);

                    setTimeout(()=>{
                        expandExcerpts?.onComplete && expandExcerpts.onComplete()
                    }, 2000)
                }
                else{
                    // do nothing, was clicked again
                    console.log("Excerpts already exist")
                }
            }
            else{
                tearDownExcerpts(this.editor, concept)
                removeProgressiveBlur(this.editor); // TODO: do this globally
            }
        }, [shape.props.expanded])

		return (
			<HTMLContainer 
				id={shape.id}
				className={styles.container}				
				>
					
				{
				isHovered &&  shape.props.description && (
					<motion.div 
						className={styles.hoverDescription}
						initial={{ opacity: 0, }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3, ease: "linear" }}
						style={{ transform: 'translateX(-50%)', overflow: 'hidden' }}
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
                        }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    >
                <ConceptStar 
                    selected={this.editor.getOnlySelectedShapeId() === shape.id}
                    pulseTrigger={pulseTrigger}
                />
                    <motion.p 
                        className={styles.editorContent} 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        transition={{ delay: 2, duration: 1, ease: 'easeInOut' }}
                    >
                        {shape.props.plainText}
                    </motion.p>
					{/* <EditorContent 
						editor={editor}
						// onKeyDown={stopEventPropagation}
						className={styles.editorContent}
					/> */}
				</div>
			</HTMLContainer>
		)
	}

	indicator(shape: ConceptShape) {
        return null
		// return <rect width={shape.props.w} height={shape.props.h} />

	}
}