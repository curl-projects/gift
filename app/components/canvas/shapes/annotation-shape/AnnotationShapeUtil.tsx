import {
	BaseBoxShapeUtil,
	Geometry2d,
	Rectangle2d,
	TLBaseShape,
	HTMLContainer,
	stopEventPropagation,
} from '@tldraw/editor'

import { T, createShapeId } from 'tldraw';
import { useFetcher } from '@remix-run/react';
import { useDataContext } from '~/components/synchronization/DataContext';
import { useCallback, useState, useEffect, useRef, useLayoutEffect, useMemo } from 'react'
import styles from './AnnotationShapeUtil.module.css';
import { motion, useAnimate, AnimatePresence, useAnimationControls } from 'framer-motion';
import { useConstellationMode } from '~/components/canvas/custom-ui/utilities/ConstellationModeContext';
import StarterKit from '@tiptap/starter-kit';
import { EditorContent, useEditor } from '@tiptap/react';
import { useConstellationMode } from "~/components/canvas/custom-ui/utilities/ConstellationModeContext";
import Placeholder from '@tiptap/extension-placeholder'
import { getRandomLepchaCharacter } from '~/components/canvas/helpers/language-funcs';

import { GlyphAnnotation } from './GlyphAnnotation';
import { CommentAnnotation } from './CommentAnnotation';

const annotationShapeProps = {
	w: T.number,
	h: T.number,
	annotationType: T.string,
	text: T.string,
	temporary: T.boolean,
	from: T.number,
	to: T.number,
	selected: T.boolean,
	hovered: T.boolean,
	glyph: T.any,
}

type AnnotationShape = TLBaseShape<
	'annotation',
	{
		w: number
		h: number
		annotationType: string,
		text: string,
		temporary: boolean,
		from: number,
		to: number,
		selected: boolean,
		hovered: boolean,
		glyph: any,
	}
>

/** @public */
export class AnnotationShapeUtil extends BaseBoxShapeUtil<AnnotationShape> {
	static override type = 'annotation' as const
	static override props = annotationShapeProps

	override canEdit = () => false
	override canResize = () => false
    override hideSelectionBoundsBg = () => true;
    override hideSelectionBoundsFg = () => true;

	getDefaultProps(): AnnotationShape['props'] {
		return { 
			w: 200,
			h: 56,
			annotationType: "comment", // options are 'comment' / 'glyph' / 'etc.
			text: "",
			temporary: false,
			from: 0,
			to: 10,
			selected: false,
			hovered: false,
			glyph: getRandomLepchaCharacter(),
		}
	}

	getGeometry(shape: AnnotationShape): Geometry2d {
		return new Rectangle2d({
			width: shape.props.w,
			height: shape.props.h,
			isFilled: true,
		})
	}

	component(shape: AnnotationShape) {
		const { data } = useDataContext();
		const [isHovered, setIsHovered] = useState(false);
		const shapeRef = useRef<HTMLDivElement>(null);
		const [scope, animate] = useAnimate();
		const fetcher = useFetcher();
		const { setNarratorEvent } = useConstellationMode();

		const isOnlySelected = this.editor.getOnlySelectedShape()?.id === shape.id


        useEffect(() => {
            if (fetcher.state === "idle" && fetcher.data && fetcher.data.error) {
                console.error("Fetcher Error:", fetcher?.data?.error);
            }
        }, [fetcher.state, fetcher.data]);

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
	

		return (
			<div 
				id={shape.id}
				className={styles.container}	
				ref={scope}			
				>
			{
				{
					'comment': <CommentAnnotation 
							data={data}
							animate={animate}	
							shape={shape}
							shapeRef={shapeRef}
							isOnlySelected={isOnlySelected}
							tldrawEditor={this.editor}
							fetcher={fetcher}
					/>, 
				 'glyph': <GlyphAnnotation 
							data={data}
							animate={animate}	
							shape={shape}
							shapeRef={shapeRef}
							isOnlySelected={isOnlySelected}
							tldrawEditor={this.editor}
							fetcher={fetcher}
				 />}[shape.props.annotationType]
			}	
			</div>
		)
	}

	indicator(shape: AnnotationShape) {
        return null
		// return <rect width={shape.props.w} height={shape.props.h} />
	}


}