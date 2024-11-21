import {
	BaseBoxShapeUtil,
	Geometry2d,
	Rectangle2d,
	TLBaseShape,
	HTMLContainer,
	stopEventPropagation,
} from '@tldraw/editor'

import { T } from 'tldraw';
import { useDataContext } from '~/components/synchronization/DataContext';

import { useStarFireSync } from '~/components/synchronization/StarFireSync';
import { NewStar } from './MinimapStar';

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
		return (
			<NewStar
				person={shape.props.person}
				isActive={shape.props.isActive}
			/>
		);
	}

	indicator(shape: MinimapStarShape) {
        return null
		// return <rect width={shape.props.w} height={shape.props.h} />

	}
}