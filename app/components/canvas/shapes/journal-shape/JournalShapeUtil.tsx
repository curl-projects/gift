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
import { JournalThread } from './JournalThread';
import { JournalBorder } from './JournalBorder';

const journalShapeProps = {
	w: T.number,
	h: T.number,
}

type JournalShape = TLBaseShape<
	'journal',
	{
		w: number
		h: number
	}
>

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
			w: window.innerWidth * 0.4,
			h: window.innerHeight * 0.8,
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

        useEffect(() => {
            const handleResize = () => {
                this.editor.updateShape({
                  type: shape.type,
                  id: shape.id,
                  props: {
                    w: window.innerWidth * 0.4,
                    h: window.innerHeight * 0.8
                  }
            });
            };
        
            window.addEventListener('resize', handleResize);
        
            return () => {
                window.removeEventListener('resize', handleResize);
            };
          }, [this.editor, shape]);

		return (
			<HTMLContainer 
				id={shape.id}
				className={styles.container}
                style={{
                    width: shape.props.w,
                    height: shape.props.h,
                }}				
				>
				<div 
                    className={styles.shapeContent} 
                    style={{
                        cursor: 'pointer',
                        }}   
                    >
                    <motion.div
                        className={styles.shapeContentBackground}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 1 }} // Adjust delay as needed
                        style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: 'url("/assets/old-paper.jpg")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        }}
                    />
                                    
                        {/* outer border */}
                        <JournalBorder borderThickness={4} distance={20}/>

                        {/* inner border */}
                        <JournalBorder borderThickness={2} distance={30}/>

                        {/* <InkBleed 
                            initialBlur={200}
                            delay={0.5}
                            duration={4}
                            >
                            <div className={styles.exampleCircle}/>
                        </InkBleed>
                        <InkBleed
                            initialBlur={4}
                            delay={0.5}
                            duration={1}
                        >
                            <h1 className={styles.journalLargeText}>The Orrery</h1>
                        </InkBleed> */}
                </div>
                
                <svg className={styles.animatedLine} viewBox={`0 0 ${shape.props.w} ${shape.props.h}`}>

                    <JournalThread d={`M -5 -5 L ${shape.props.w + 5} -5 L ${shape.props.w + 5} ${shape.props.h + 5} L -5 ${shape.props.h + 5} Z`} delay={0} duration={1} strokeWidth={1} pageContainer />

                    {/* outer line */}
                    <JournalThread d={`M 20 20 L ${shape.props.w - 20} 20`} delay={1} strokeWidth={4}/>
                    <JournalThread d={`M 20 20 L 20 ${shape.props.h - 20}`} delay={1} strokeWidth={4}/>
                    <JournalThread d={`M 20 ${shape.props.h - 20} L ${shape.props.w - 20} ${shape.props.h - 20}`} delay={1.5} strokeWidth={4} />
                    <JournalThread d={`M ${shape.props.w - 20} 20 L ${shape.props.w - 20} ${shape.props.h - 20}`} delay={1.5} strokeWidth={4} />

                    {/* inner line */}
                    <JournalThread d={`M 30 30 L ${shape.props.w - 30} 30`} delay={2} strokeWidth={2} />
                    <JournalThread d={`M 30 30 L 30 ${shape.props.h - 30}`} delay={2} strokeWidth={2} />
                    <JournalThread d={`M 30 ${shape.props.h - 30} L ${shape.props.w - 30} ${shape.props.h - 30}`} delay={2.5} strokeWidth={2} />
                    <JournalThread d={`M ${shape.props.w - 30} 30 L ${shape.props.w - 30} ${shape.props.h - 30}`} delay={2.5} strokeWidth={2} />

                </svg>
			</HTMLContainer>
		)
	}

	indicator(shape: JournalShape) {
        return null
		// return <rect width={shape.props.w} height={shape.props.h} />

	}
}