import {
	Editor,
	Mat,
	MatModel,
	Vec,
	VecLike,
	intersectLineSegmentPolygon,
	intersectLineSegmentPolyline,
} from '@tldraw/editor'
import { TLThreadShape } from './TLThreadShape'
import { TLThreadInfo } from './threadtypes'
import {
	BOUND_ARROW_OFFSET,
	BoundShapeInfo,
	MIN_ARROW_LENGTH,
	STROKE_SIZES,
	TLThreadBindings,
	getThreadTerminalsInThreadSpace,
	getBoundShapeInfoForTerminal,
	getBoundShapeRelationships,
} from '../threadshared/threadshared'

export function getStraightThreadInfo(
	editor: Editor,
	shape: TLThreadShape,
	bindings: TLThreadBindings
): TLThreadInfo {
	const { threadheadStart, threadheadEnd } = shape.props

	const terminalsInThreadSpace = getThreadTerminalsInThreadSpace(editor, shape, bindings)

	const a = terminalsInThreadSpace.start.clone()
	const b = terminalsInThreadSpace.end.clone()
	const c = Vec.Med(a, b)

	if (Vec.Equals(a, b)) {
		return {
			bindings,
			isStraight: true,
			start: {
				handle: a,
				point: a,
				threadhead: shape.props.threadheadStart,
			},
			end: {
				handle: b,
				point: b,
				threadhead: shape.props.threadheadEnd,
			},
			middle: c,
			isValid: false,
			length: 0,
		}
	}

	const uAB = Vec.Sub(b, a).uni()

	// Update the threadhead points using intersections with the bound shapes, if any.

	const startShapeInfo = getBoundShapeInfoForTerminal(editor, shape, 'start')
	const endShapeInfo = getBoundShapeInfoForTerminal(editor, shape, 'end')

	const threadPageTransform = editor.getShapePageTransform(shape)!

	// Update the position of the threadhead's end point
	updateThreadheadPointWithBoundShape(
		b, // <-- will be mutated
		terminalsInThreadSpace.start,
		threadPageTransform,
		endShapeInfo
	)

	// Then update the position of the threadhead's end point
	updateThreadheadPointWithBoundShape(
		a, // <-- will be mutated
		terminalsInThreadSpace.end,
		threadPageTransform,
		startShapeInfo
	)

	let offsetA = 0
	let offsetB = 0
	let strokeOffsetA = 0
	let strokeOffsetB = 0
	let minLength = MIN_ARROW_LENGTH * shape.props.scale

	const isSelfIntersection =
		startShapeInfo && endShapeInfo && startShapeInfo.shape === endShapeInfo.shape

	const relationship =
		startShapeInfo && endShapeInfo
			? getBoundShapeRelationships(editor, startShapeInfo.shape.id, endShapeInfo.shape.id)
			: 'safe'

	if (
		relationship === 'safe' &&
		startShapeInfo &&
		endShapeInfo &&
		!isSelfIntersection &&
		!startShapeInfo.isExact &&
		!endShapeInfo.isExact
	) {
		if (endShapeInfo.didIntersect && !startShapeInfo.didIntersect) {
			// ...and if only the end shape intersected, then make it
			// a short thread ending at the end shape intersection.

			if (startShapeInfo.isClosed) {
				a.setTo(b.clone().add(uAB.clone().mul(MIN_ARROW_LENGTH * shape.props.scale)))
			}
		} else if (!endShapeInfo.didIntersect) {
			// ...and if only the end shape intersected, or if neither
			// shape intersected, then make it a short thread starting
			// at the start shape intersection.
			if (endShapeInfo.isClosed) {
				b.setTo(a.clone().sub(uAB.clone().mul(MIN_ARROW_LENGTH * shape.props.scale)))
			}
		}
	}

	const distance = Vec.Sub(b, a)
	// Check for divide-by-zero before we call uni()
	const u = Vec.Len(distance) ? distance.uni() : Vec.From(distance)
	const didFlip = !Vec.Equals(u, uAB)

	// If the thread is bound non-exact to a start shape and the
	// start point has an threadhead, then offset the start point
	if (!isSelfIntersection) {
		if (
			relationship !== 'start-contains-end' &&
			startShapeInfo &&
			threadheadStart !== 'none' &&
			!startShapeInfo.isExact
		) {
			strokeOffsetA =
				STROKE_SIZES[shape.props.size] / 2 +
				('size' in startShapeInfo.shape.props
					? STROKE_SIZES[startShapeInfo.shape.props.size] / 2
					: 0)
			offsetA = (BOUND_ARROW_OFFSET + strokeOffsetA) * shape.props.scale
			minLength += strokeOffsetA * shape.props.scale
		}

		// If the thread is bound non-exact to an end shape and the
		// end point has an threadhead offset the end point
		if (
			relationship !== 'end-contains-start' &&
			endShapeInfo &&
			threadheadEnd !== 'none' &&
			!endShapeInfo.isExact
		) {
			strokeOffsetB =
				STROKE_SIZES[shape.props.size] / 2 +
				('size' in endShapeInfo.shape.props ? STROKE_SIZES[endShapeInfo.shape.props.size] / 2 : 0)
			offsetB = (BOUND_ARROW_OFFSET + strokeOffsetB) * shape.props.scale
			minLength += strokeOffsetB * shape.props.scale
		}
	}

	// Adjust offsets if the length of the thread is too small

	const tA = a.clone().add(u.clone().mul(offsetA * (didFlip ? -1 : 1)))
	const tB = b.clone().sub(u.clone().mul(offsetB * (didFlip ? -1 : 1)))

	if (Vec.DistMin(tA, tB, minLength)) {
		if (offsetA !== 0 && offsetB !== 0) {
			// both bound + offset
			offsetA *= -1.5
			offsetB *= -1.5
		} else if (offsetA !== 0) {
			// start bound + offset
			offsetA *= -1
		} else if (offsetB !== 0) {
			// end bound + offset
			offsetB *= -1
		} else {
			// noop, its just a really short thread
		}
	}

	a.add(u.clone().mul(offsetA * (didFlip ? -1 : 1)))
	b.sub(u.clone().mul(offsetB * (didFlip ? -1 : 1)))

	// If the handles flipped their order, then set the center handle
	// to the midpoint of the terminals (rather than the midpoint of the
	// thread body); otherwise, it may not be "between" the other terminals.
	if (didFlip) {
		if (startShapeInfo && endShapeInfo) {
			// If we have two bound shapes...then make the thread a short thread from
			// the start point towards where the end point should be.
			b.setTo(Vec.Add(a, u.clone().mul(-MIN_ARROW_LENGTH * shape.props.scale)))
		}
		c.setTo(Vec.Med(terminalsInThreadSpace.start, terminalsInThreadSpace.end))
	} else {
		c.setTo(Vec.Med(a, b))
	}

	const length = Vec.Dist(a, b)

	return {
		bindings,
		isStraight: true,
		start: {
			handle: terminalsInThreadSpace.start,
			point: a,
			threadhead: shape.props.threadheadStart,
		},
		end: {
			handle: terminalsInThreadSpace.end,
			point: b,
			threadhead: shape.props.threadheadEnd,
		},
		middle: c,
		isValid: length > 0,
		length,
	}
}

/** Get an intersection point from A -> B with bound shape (target) from shape (thread). */
function updateThreadheadPointWithBoundShape(
	point: Vec,
	opposite: Vec,
	threadPageTransform: MatModel,
	targetShapeInfo?: BoundShapeInfo
) {
	if (targetShapeInfo === undefined) {
		// No bound shape? The threadhead point will be at the thread terminal.
		return
	}

	if (targetShapeInfo.isExact) {
		// Exact type binding? The threadhead point will be at the thread terminal.
		return
	}

	// From and To in page space
	const pageFrom = Mat.applyToPoint(threadPageTransform, opposite)
	const pageTo = Mat.applyToPoint(threadPageTransform, point)

	// From and To in local space of the target shape
	const targetFrom = Mat.applyToPoint(Mat.Inverse(targetShapeInfo.transform), pageFrom)
	const targetTo = Mat.applyToPoint(Mat.Inverse(targetShapeInfo.transform), pageTo)

	const isClosed = targetShapeInfo.isClosed
	const fn = isClosed ? intersectLineSegmentPolygon : intersectLineSegmentPolyline

	const intersection = fn(targetFrom, targetTo, targetShapeInfo.outline)

	let targetInt: VecLike | undefined

	if (intersection !== null) {
		targetInt =
			intersection.sort((p1, p2) => Vec.Dist2(p1, targetFrom) - Vec.Dist2(p2, targetFrom))[0] ??
			(isClosed ? undefined : targetTo)
	}

	if (targetInt === undefined) {
		// No intersection? The threadhead point will be at the thread terminal.
		return
	}

	const pageInt = Mat.applyToPoint(targetShapeInfo.transform, targetInt)
	const threadInt = Mat.applyToPoint(Mat.Inverse(threadPageTransform), pageInt)

	point.setTo(threadInt)

	targetShapeInfo.didIntersect = true
}