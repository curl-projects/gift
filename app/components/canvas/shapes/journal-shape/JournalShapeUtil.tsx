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
                        <div className={styles.outerBorder}/>
                        <div className={styles.innerBorder}/>
                        <h1 className={styles.journalLargeText}>The Orrery</h1>
				</div>

			</HTMLContainer>
		)
	}

	indicator(shape: JournalShape) {
        return null
		// return <rect width={shape.props.w} height={shape.props.h} />

	}
}