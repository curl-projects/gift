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
import styles from './GlyphShapeUtil.module.css';
import { motion, useAnimate, AnimatePresence } from 'framer-motion';

import { getRandomLepchaCharacter } from '~/components/canvas/helpers/language-funcs';
import { InkBleed } from '~/components/canvas/custom-ui/post-processing-effects/InkBleed'

const glyphShapeProps = {
	w: T.number,
	h: T.number,
    glyph: T.string,
	text: T.string,
}

type GlyphShape = TLBaseShape<
	'glyph',
	{
		w: number
		h: number
        glyph: string,
		text: string,
	}
>

/** @public */
export class GlyphShapeUtil extends BaseBoxShapeUtil<GlyphShape> {
	static override type = 'glyph' as const
	static override props = glyphShapeProps

	override canEdit = () => false
	override canResize = () => false
    override hideSelectionBoundsBg = () => true
    override hideSelectionBoundsFg = () => true;

	getDefaultProps(): GlyphShape['props'] {
		return { 
			w: 56,
			h: 56,
			glyph: getRandomLepchaCharacter(),
			text: "",
		}
	}

	getGeometry(shape: GlyphShape): Geometry2d {
		return new Rectangle2d({
			width: shape.props.w,
			height: shape.props.h,
			isFilled: true,
		})
	}

	component(shape: GlyphShape) {
        const [scope, animate] = useAnimate();
		const bounds = this.editor.getShapeGeometry(shape).bounds
		const data: any = useDataContext();

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

		return (
			<HTMLContainer 
				id={shape.id}
				className={styles.container}				
				>
				<div 
                    className={styles.shapeContent} 
                    ref={shapeRef} 
                    style={{
                        cursor: 'pointer',
                        }}
                    >
                    <InkBleed 
                        initialBlur={4}
                        delay={0}
                        duration={1}>
                        <div className={styles.glyphContainer}>
                            <p className={styles.glyph}>{shape.props.glyph}</p>
                        </div>
                    </InkBleed>
				</div>
			</HTMLContainer>
		)
	}

	indicator(shape: GlyphShape) {
        return null
		// return <rect width={shape.props.w} height={shape.props.h} />

	}
}