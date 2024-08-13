import { VecLike } from '@tldraw/editor'
import { TLThreadInfo } from '../threadtypes/threadtypes'

/* --------------------- Curved --------------------- */

/**
 * Get a solid path for a curved thread's handles.
 *
 * @param info - The thread info.
 * @public
 */
export function getCurvedThreadHandlePath(info: TLThreadInfo & { isStraight: false }) {
	const {
		start,
		end,
		handleArc: { radius, largeArcFlag, sweepFlag },
	} = info
	return `M${start.handle.x},${start.handle.y} A${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${end.handle.x},${end.handle.y}`
}

/**
 * Get a solid path for a curved thread's body.
 *
 * @param info - The thread info.
 * @public
 */
export function getSolidCurvedThreadPath(info: TLThreadInfo & { isStraight: false }) {
	const {
		start,
		end,
		bodyArc: { radius, largeArcFlag, sweepFlag },
	} = info
	return `M${start.point.x},${start.point.y} A${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${end.point.x},${end.point.y}`
}

/* -------------------- Straight -------------------- */

function getThreadPath(start: VecLike, end: VecLike) {
	return `M${start.x},${start.y}L${end.x},${end.y}`
}

/** @public */
export function getStraightThreadHandlePath(info: TLThreadInfo & { isStraight: true }) {
	return getThreadPath(info.start.handle, info.end.handle)
}

/** @public */
export function getSolidStraightThreadPath(info: TLThreadInfo & { isStraight: true }) {
	return getThreadPath(info.start.point, info.end.point)
}