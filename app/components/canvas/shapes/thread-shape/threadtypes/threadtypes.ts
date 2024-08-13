import { VecLike } from '@tldraw/editor'
import { TLThreadShapeThreadheadStyle } from './TLThreadShape'
import { TLThreadBindings } from '../threadshared/threadshared'

/** @public */
export interface TLThreadPoint {
	handle: VecLike
	point: VecLike
	threadhead: TLThreadShapeThreadheadStyle
}

/** @public */
export interface TLArcInfo {
	center: VecLike
	radius: number
	size: number
	length: number
	largeArcFlag: number
	sweepFlag: number
}

/** @public */
export type TLThreadInfo =
	| {
			bindings: TLThreadBindings
			isStraight: false
			start: TLThreadPoint
			end: TLThreadPoint
			middle: VecLike
			handleArc: TLArcInfo
			bodyArc: TLArcInfo
			isValid: boolean
	  }
	| {
			bindings: TLThreadBindings
			isStraight: true
			start: TLThreadPoint
			end: TLThreadPoint
			middle: VecLike
			isValid: boolean
			length: number
	  }