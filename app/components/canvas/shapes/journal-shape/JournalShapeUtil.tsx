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
import styles from './JournalShapeUtil.module.css';
import { motion, useAnimate, AnimatePresence } from 'framer-motion';

import { useStarFireSync } from "~/components/synchronization/StarFireSync"
import { ParchmentJournal } from './parchment-journal/ParchmentJournal';
import { ModernJournal } from './modern-journal/ModernJournal';
import { useParams } from "@remix-run/react";

const journalShapeProps = {
	w: T.number,
	h: T.number,
    expanded: T.boolean,
    page: T.string,
}

type JournalShape = TLBaseShape<
	'journal',
	{
		w: number,
		h: number,
        expanded: boolean,
        page: string,
	}
>

export const journalWidthScaling = 0.6
export const journalHeightScaling = 0.8
export const journalRightOffset = 0.4
export const journalLeftOffset = 0.1

/** @public */
export class JournalShapeUtil extends BaseBoxShapeUtil<JournalShape> {
	static override type = 'journal' as const
	static override props = journalShapeProps

	override canEdit = () => false
	override canResize = () => false
    override hideSelectionBoundsBg = () => false
    override hideSelectionBoundsFg = () => false;

        
	getDefaultProps(): JournalShape['props'] {
		return { 
			w: window.innerWidth * journalWidthScaling,
			h: window.innerHeight * journalHeightScaling,
            expanded: false,
            page: 'cover',
		}
	}

	getGeometry(shape: JournalShape): Geometry2d {
		return new Rectangle2d({
			width: shape.props.w,
			height: shape.props.h,
			isFilled: true,
		})
	}

	component(shape: JournalShape) {
        const [scope, animate] = useAnimate();
		const bounds = this.editor.getShapeGeometry(shape).bounds
		const { data } = useDataContext();
        const contentRef = useRef<HTMLDivElement>(null);
        const { journalMode, setJournalMode, journalZooms } = useStarFireSync()
        const { person } = useParams();
        const selectedShapeIds = this.editor.getSelectedShapeIds();

        // zoom to selected shapes (excerpts or name shape)
        useEffect(()=>{
            // trigger camera change
            if(selectedShapeIds.length === 1){
                const selectedShape = this.editor.getShape(selectedShapeIds[0]);
                if(selectedShape?.type === 'excerpt'){
                    const excerptBounds = this.editor.getShapePageBounds(selectedShape)
                    const newBounds = {
                        w: excerptBounds.width,
                        h: excerptBounds.height,
                        x: excerptBounds.x + window.innerWidth * 0.30,
                        y: excerptBounds.y
                    }
                    
                    this.editor.zoomToBounds(newBounds, {
                        animation: {
                            duration: 300,
                            easing: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
                    },
                        targetZoom: 1,
                    });
                }
            }
            else{
                
            const nameShape = this.editor.getShape(createShapeId(person))    
           
            if(nameShape){
                const bounds = this.editor.getShapePageBounds(nameShape)
                const newBounds = {
                    w: bounds.width,
                    h: bounds.height,
                    x: bounds.x + window.innerWidth * 0.30,
                    y: bounds.y
                }
                
                this.editor.zoomToBounds(newBounds, {
                    animation: {
                        duration: 300,
                        easing: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
                        },
                        targetZoom: 1,
                    });
                }
            }
        }, [])

        useEffect(()=>{
            if(!journalMode.active){
                const nameShape = this.editor.getShape(createShapeId(person))
                if(nameShape){
                    this.editor.zoomToBounds(this.editor.getShapePageBounds(nameShape), {
                        animation: {
                            duration: 1000,
                            easing: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
                        },
                        targetZoom: 1,
                    });
                }
                journalMode.onComplete && journalMode.onComplete();
            }
        }, [journalMode])

        useEffect(() => {
            const handleResize = () => {
                this.editor.updateShape({
                  type: shape.type,
                  id: shape.id,
                  props: {
                    w: window.innerWidth * journalWidthScaling,
                    h: window.innerHeight * journalHeightScaling
                  }
            });
            };
        
            window.addEventListener('resize', handleResize);
        
            return () => {
                window.removeEventListener('resize', handleResize);
            };
          }, [this.editor, shape]);

        //   triggers on animation frame -- this should be conditional on journalMode.position
          useEffect(() => {
            const margin = window.innerHeight * 0.1;
            let animationId: number;

            const updateShapePosition = () => {
                if (!journalZooms) {
                    const offset = journalMode.position === 'left' ? window.innerWidth * journalLeftOffset : window.innerWidth * journalRightOffset;
                    const { x, y } = this.editor.screenToPage({ x: offset - margin, y: margin });
                    this.editor.updateShape({
                        type: shape.type,
                        id: shape.id,
                        x: x,
                        y: y,
                        props: {
                            w: window.innerWidth * journalWidthScaling,
                            h: window.innerHeight * journalHeightScaling,
                        }
                    });
                    animationId = requestAnimationFrame(updateShapePosition);
                }
            };

            if (!journalZooms) {
                animationId = requestAnimationFrame(updateShapePosition);
            }

            return () => {
                if (animationId) {
                    cancelAnimationFrame(animationId);
                }
            };
          }, [journalMode.position, journalZooms]);   

		return (
            <HTMLContainer style={{
                width: shape.props.w,
                height: shape.props.h,
                transform: journalZooms ? "initial" : "scale(var(--tl-scale))",
                }}
                >
                <AnimatePresence>
                    {shape.props.expanded &&
                        <motion.div 
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1, ease: 'easeInOut'}}
                        onAnimationComplete={(animation) => {
                            if(animation?.opacity === 0){
                                this.editor.deleteShape(shape.id) // dispose of shape after completion
                            }
                        }}
                        key='journal'
                        id={shape.id}
                        className={styles.container}
                        style={{
                            width: "100%",
                            height: "100%",
                        }}				
                        >
                            {
                                journalMode.variant === 'parchment' ?
                                <ParchmentJournal shape={shape} journalMode={journalMode} contentRef={contentRef}/>
                                :
                                <ModernJournal 
                                    shape={shape} 
                                    contentRef={contentRef}
                                    tldrawEditor={this.editor}
                                />
                            }
                        </motion.div>
                    }
                </AnimatePresence>
            </HTMLContainer>
		)
        
	}
    

	indicator(shape: JournalShape) {
        return null
		// return <rect width={shape.props.w} height={shape.props.h} />

	}
}