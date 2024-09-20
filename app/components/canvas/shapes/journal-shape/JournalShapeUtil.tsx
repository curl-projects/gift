import {
	BaseBoxShapeUtil,
	Geometry2d,
	Rectangle2d,
	TLBaseShape,
	HTMLContainer,
	stopEventPropagation,
} from '@tldraw/editor'

import { T, createShapeId } from 'tldraw';
import { useLoaderData } from '@remix-run/react';
import { useCallback, useState, useEffect, useRef, useLayoutEffect, useMemo } from 'react'
import { EditorContent, useEditor } from '@tiptap/react';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { Node } from "@tiptap/core";
import Placeholder from '@tiptap/extension-placeholder'
import styles from './JournalShapeUtil.module.css';
import { motion, useAnimate, AnimatePresence } from 'framer-motion';
import { InkBleed } from "~/components/canvas/custom-ui/post-processing-effects/InkBleed"
import { JournalThread } from './parchment-journal/journal-thread/JournalThread';
import { JournalBorder } from './parchment-journal/journal-border/JournalBorder';
import { JournalMenu } from './parchment-journal/journal-menu/JournalMenu';
import { useStarFireSync } from "~/components/synchronization/StarFireSync"
import { ParchmentJournal } from './parchment-journal/ParchmentJournal';
import { ModernJournal } from './modern-journal/ModernJournal';

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

const journalWidthScaling = 0.6
const journalHeightScaling = 0.8
export const journalMarginOffset = 0.4

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
		const data: any = useLoaderData();
        const contentRef = useRef<HTMLDivElement>(null);
        const { journalMode } = useStarFireSync()


        useEffect(()=>{
            // trigger camera change
            const nameShape = this.editor.getShape(createShapeId('andre-vacha'))
           
            if(nameShape){
                const bounds = this.editor.getShapePageBounds(nameShape)
                const newBounds = {
                    w: bounds.width,
                    h: bounds.height,
                    x: bounds.x + window.innerWidth * 0.20,
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
        }, [])

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

        //   triggers on animation frame
          useEffect(() => {
            const margin = window.innerHeight * 0.1;

            const updateShapePosition = () => {
                const { x, y } = this.editor.screenToPage({ x: window.innerWidth * journalMarginOffset - margin, y: margin });
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
                requestAnimationFrame(updateShapePosition);
            };

            const animationId = requestAnimationFrame(updateShapePosition);

            return () => cancelAnimationFrame(animationId);
          }, [this.editor, shape]);   

		return (
            <HTMLContainer style={{
                width: shape.props.w,
                height: shape.props.h,
                transform: 'scale(var(--tl-scale))',
                }}>
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
                            {/* <ParchmentJournal shape={shape} journalMode={journalMode} contentRef={contentRef}/> */}
                            <ModernJournal shape={shape} journalMode={journalMode} contentRef={contentRef}/>
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