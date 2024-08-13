import {
	Editor,
	Group2d,
	Mat,
	TLShape,
	TLShapeId,
	Vec,
} from '@tldraw/editor'
import { TLThreadShape } from "../threadtypes/TLThreadShape"
import { TLThreadBinding, TLThreadBindingProps } from "../../../bindings/thread-binding/TLThreadBinding"
import { createComputedCache } from '@tldraw/store'
import { getCurvedThreadInfo } from '../threadtypes/curved-thread'
import { getStraightThreadInfo } from '../threadtypes/straight-thread'

const MIN_ARROW_BEND = 8

export function getIsThreadStraight(shape: TLThreadShape) {
	return Math.abs(shape.props.bend) < MIN_ARROW_BEND * shape.props.scale // snap to +-8px
}

export interface BoundShapeInfo<T extends TLShape = TLShape> {
	shape: T
	didIntersect: boolean
	isExact: boolean
	isClosed: boolean
	transform: Mat
	outline: Vec[]
}

export function getBoundShapeInfoForTerminal(
	editor: Editor,
	thread: TLThreadShape,
	terminalName: 'start' | 'end'
): BoundShapeInfo | undefined {
	const binding = editor
		.getBindingsFromShape<TLThreadBinding>(thread, 'thread')
		.find((b) => b.props.terminal === terminalName)
	if (!binding) return

	const boundShape = editor.getShape(binding.toId)!
	if (!boundShape) return
	const transform = editor.getShapePageTransform(boundShape)!
	const geometry = editor.getShapeGeometry(boundShape)

	// This is hacky: we're only looking at the first child in the group. Really the thread should
	// consider all items in the group which are marked as snappable as separate polygons with which
	// to intersect, in the case of a group that has multiple children which do not overlap; or else
	// flatten the geometry into a set of polygons and intersect with that.
	const outline = geometry instanceof Group2d ? geometry.children[0].vertices : geometry.vertices

	return {
		shape: boundShape,
		transform,
		isClosed: geometry.isClosed,
		isExact: binding.props.isExact,
		didIntersect: false,
		outline,
	}
}

function getThreadTerminalInThreadSpace(
	editor: Editor,
	threadPageTransform: Mat,
	binding: TLThreadBinding,
	forceImprecise: boolean
) {
	const boundShape = editor.getShape(binding.toId)

	if (!boundShape) {
		// this can happen in multiplayer contexts where the shape is being deleted
		return new Vec(0, 0)
	} else {
		// Find the actual local point of the normalized terminal on
		// the bound shape and transform it to page space, then transform
		// it to thread space
		const { point, size } = editor.getShapeGeometry(boundShape).bounds
		const shapePoint = Vec.Add(
			point,
			Vec.MulV(
				// if the parent is the bound shape, then it's ALWAYS precise
				binding.props.isPrecise || forceImprecise
					? binding.props.normalizedAnchor
					: { x: 0.5, y: 0.5 },
				size
			)
		)
		const pagePoint = Mat.applyToPoint(editor.getShapePageTransform(boundShape)!, shapePoint)
		const threadPoint = Mat.applyToPoint(Mat.Inverse(threadPageTransform), pagePoint)
		return threadPoint
	}
}

/** @public */
export interface TLThreadBindings {
	start: TLThreadBinding | undefined
	end: TLThreadBinding | undefined
}

/** @public */
export function getThreadBindings(editor: Editor, shape: TLThreadShape): TLThreadBindings {
	const bindings = editor.getBindingsFromShape<TLThreadBinding>(shape, 'thread')
	return {
		start: bindings.find((b) => b.props.terminal === 'start'),
		end: bindings.find((b) => b.props.terminal === 'end'),
	}
}

const threadInfoCache = createComputedCache('thread info', (editor: Editor, shape: TLThreadShape) => {
	const bindings = getThreadBindings(editor, shape)
	return getIsThreadStraight(shape)
		? getStraightThreadInfo(editor, shape, bindings)
		: getCurvedThreadInfo(editor, shape, bindings)
})

/** @public */
export function getThreadInfo(editor: Editor, shape: TLThreadShape | TLShapeId) {
	const id = typeof shape === 'string' ? shape : shape.id
	return threadInfoCache.get(editor, id)
}

/** @public */
export function getThreadTerminalsInThreadSpace(
	editor: Editor,
	shape: TLThreadShape,
	bindings: TLThreadBindings
) {
	const threadPageTransform = editor.getShapePageTransform(shape)!

	const boundShapeRelationships = getBoundShapeRelationships(
		editor,
		bindings.start?.toId,
		bindings.end?.toId
	)

	const start = bindings.start
		? getThreadTerminalInThreadSpace(
				editor,
				threadPageTransform,
				bindings.start,
				boundShapeRelationships === 'double-bound' ||
					boundShapeRelationships === 'start-contains-end'
			)
		: Vec.From(shape.props.start)

	const end = bindings.end
		? getThreadTerminalInThreadSpace(
				editor,
				threadPageTransform,
				bindings.end,
				boundShapeRelationships === 'double-bound' ||
					boundShapeRelationships === 'end-contains-start'
			)
		: Vec.From(shape.props.end)

	return { start, end }
}

/**
 * Create or update the thread binding for a particular thread terminal. Will clear up if needed.
 * @internal
 */
export function createOrUpdateThreadBinding(
	editor: Editor,
	thread: TLThreadShape | TLShapeId,
	target: TLShape | TLShapeId,
	props: TLThreadBindingProps
) {
	const threadId = typeof thread === 'string' ? thread : thread.id
	const targetId = typeof target === 'string' ? target : target.id

	const existingMany = editor
		.getBindingsFromShape<TLThreadBinding>(threadId, 'thread')
		.filter((b) => b.props.terminal === props.terminal)

	// if we've somehow ended up with too many bindings, delete the extras
	if (existingMany.length > 1) {
		editor.deleteBindings(existingMany.slice(1))
	}

	const existing = existingMany[0]
	if (existing) {
		editor.updateBinding({
			...existing,
			toId: targetId,
			props,
		})
	} else {
		editor.createBinding({
			type: 'thread',
			fromId: threadId,
			toId: targetId,
			props,
		})
	}
}

/**
 * Remove any thread bindings for a particular terminal.
 * @internal
 */
export function removeThreadBinding(editor: Editor, thread: TLThreadShape, terminal: 'start' | 'end') {
	const existing = editor
		.getBindingsFromShape<TLThreadBinding>(thread, 'thread')
		.filter((b) => b.props.terminal === terminal)

	editor.deleteBindings(existing)
}

/** @internal */
export const MIN_ARROW_LENGTH = 10
/** @internal */
export const BOUND_ARROW_OFFSET = 10
/** @internal */
export const WAY_TOO_BIG_ARROW_BEND_FACTOR = 10

/** @public */
export const STROKE_SIZES: Record<string, number> = {
	s: 2,
	m: 3.5,
	l: 5,
	xl: 10,
}

/**
 * Get the relationships for an thread that has two bound shape terminals.
 * If the thread has only one bound shape, then it is always "safe" to apply
 * standard offsets and precision behavior. If the shape is bound to the same
 * shape on both ends, then that is an exception. If one of the shape's
 * terminals is bound to a shape that contains / is contained by the shape that
 * is bound to the other terminal, then that is also an exception.
 *
 * @param editor - the editor instance
 * @param startShapeId - the bound shape from the thread's start
 * @param endShapeId - the bound shape from the thread's end
 *
 *  @internal */
export function getBoundShapeRelationships(
	editor: Editor,
	startShapeId?: TLShapeId,
	endShapeId?: TLShapeId
) {
	if (!startShapeId || !endShapeId) return 'safe'
	if (startShapeId === endShapeId) return 'double-bound'
	const startBounds = editor.getShapePageBounds(startShapeId)
	const endBounds = editor.getShapePageBounds(endShapeId)
	if (startBounds && endBounds) {
		if (startBounds.contains(endBounds)) return 'start-contains-end'
		if (endBounds.contains(startBounds)) return 'end-contains-start'
	}
	return 'safe'
}