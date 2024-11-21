import {
	BaseBoxShapeUtil,
	Geometry2d,
	Rectangle2d,
	TLBaseShape,
	HTMLContainer,
	stopEventPropagation,
} from '@tldraw/editor'
import { useEffect, useRef } from 'react';

import { T } from 'tldraw';
import { useDataContext } from '~/components/synchronization/DataContext';

import { useStarFireSync } from '~/components/synchronization/StarFireSync';
import { MinimapStar } from './MinimapStar';

const minimapStarShapeProps = {
	w: T.number,
	h: T.number,
	person: T.any,
	isActive: T.boolean,
}

type MinimapStarShape = TLBaseShape<
	'minimapStar',
	{
		w: number
		h: number
		person: any,
		isActive: boolean,
	}
>

/** @public */
export class MinimapStarShapeUtil extends BaseBoxShapeUtil<MinimapStarShape> {
	static override type = 'minimapStar' as const
	static override props = minimapStarShapeProps

	override canEdit = () => false
	override canResize = () => false
    override hideSelectionBoundsBg = () => true
    override hideSelectionBoundsFg = () => true;

	getDefaultProps(): MinimapStarShape['props'] {
		return { 
			w: 200,
			h: 56,
			person: {},
			isActive: false,
		}
	}

	getGeometry(shape: MinimapStarShape): Geometry2d {
		return new Rectangle2d({
			width: shape.props.w,
			height: shape.props.h,
			isFilled: true,
		})
	}

	component(shape: MinimapStarShape) {
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

		return (
			<MinimapStar
				person={shape.props.person}
				isActive={shape.props.isActive}
				shapeRef={shapeRef}
			/>
		);
	}

	indicator(shape: MinimapStarShape) {
        return null
		// return <rect width={shape.props.w} height={shape.props.h} />

	}
}