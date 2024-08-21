import {
	BindingOnChangeOptions,
	BindingOnCreateOptions,
	BindingOnShapeChangeOptions,
	BindingOnShapeIsolateOptions,
	BindingUtil,
	Editor,
	IndexKey,
	// TLThreadBinding,
	// TLThreadBindingProps,
	// TLThreadShape,
	TLParentId,
	TLShape,
	TLShapeId,
	TLShapePartial,
	Vec,
	approximately,
	// threadBindingMigrations,
	// threadBindingProps,
	// assert,
	getIndexAbove,
	getIndexBetween,
	intersectLineSegmentCircle,
} from '@tldraw/editor'
import { getThreadBindings, getThreadInfo, removeThreadBinding } from '../../shapes/thread-shape/threadshared/threadshared'
import { TLThreadShape } from '../../shapes/thread-shape/threadtypes/TLThreadShape'
import { threadBindingProps, threadBindingMigrations, TLThreadBinding, TLThreadBindingProps } from "./TLThreadBinding"
import { calculateAnchor } from "~/components/canvas/helpers/thread-funcs";


export function omitFromStackTrace<Args extends Array<unknown>, Return>(
	fn: (...args: Args) => Return
): (...args: Args) => Return {
	const wrappedFn = (...args: Args) => {
		try {
			return fn(...args)
		} catch (error) {
			if (error instanceof Error && Error.captureStackTrace) {
				Error.captureStackTrace(error, wrappedFn)
			}
			throw error
		}
	}

	return wrappedFn
}


export const assert: (value: unknown, message?: string) => asserts value = omitFromStackTrace(
	(value, message) => {
		if (!value) {
			throw new Error(message || 'Assertion Error')
		}
	}
)


export function updateThreadBindingProps(editor: Editor, shapeId: TLShapeId) {

    // get any threads attached to the shape
    const threadBindings = editor.getBindingsToShape(shapeId, 'thread')

    for(let binding of threadBindings){
        // determine if it's the start or end shape
        if(binding.props.terminal === 'end'){
            const endShape = editor.getShape(shapeId)

            const { startAnchor, startIsExact, startIsPrecise, endAnchor, endIsExact, endIsPrecise } = calculateAnchor(null, endShape);

			editor.updateBinding({
				id: binding.id,
				type: 'thread',
				props: {
					...binding.props,
					isExact: endIsExact,
					isPrecise: endIsPrecise,
					normalizedAnchor: endAnchor,
				}
			});

    
        }
        else if(binding.props.terminal === 'start'){
            const { startAnchor, startIsExact, startIsPrecise, endAnchor, endIsExact, endIsPrecise } = calculateAnchor(null, endShape);

			editor.updateBinding({
				id: binding.id,
				type: 'thread',
				props: {
					...binding.props,
					isExact: startIsExact,
					isPrecise: startIsPrecise,
					normalizedAnchor: startAnchor,
				}
			});
        }
        else{
            throw Error('Invalid terminal; Binding:', binding)
        }
        
        // // how do i chec
        // const threadBinding = editor.getBindin(thread.id)
        // if(threadBinding){
        //     console.log("THREAD BINDING:", threadBinding)
        // }
    }

    // const bindings = getThreadBindings(editor, editor.getShape(shapeId) as TLThreadShape);
// 
    // console.log("BINDINGS:", bindings)
    // for (const binding of Object.values(bindings)) {
    //     if (binding) {
    //         const startShape = editor.getShape(binding.fromId);
    //         const endShape = editor.getShape(binding.toId);

    //         if (startShape && endShape) {
    //             const { startAnchor, startIsExact, startIsPrecise, endAnchor, endIsExact, endIsPrecise } = calculateAnchor(startShape, endShape);

    //             editor.updateBinding({
    //                 id: binding.id,
    //                 type: 'thread',
    //                 props: {
    //                     ...binding.props,
    //                     isExact: startIsExact,
    //                     isPrecise: startIsPrecise,
    //                     normalizedAnchor: startAnchor,
    //                 }
    //             });

    //             editor.updateBinding({
    //                 id: binding.id,
    //                 type: 'thread',
    //                 props: {
    //                     ...binding.props,
    //                     isExact: endIsExact,
    //                     isPrecise: endIsPrecise,
    //                     normalizedAnchor: endAnchor,
    //                 }
    //             });
    //         }
    //     }
    // }
}



/**
 * @public
 */
export class ThreadBindingUtil extends BindingUtil<TLThreadBinding> {
	static override type = 'thread'

	static override props = threadBindingProps
	static override migrations = threadBindingMigrations

	override getDefaultProps(): Partial<TLThreadBindingProps> {
		return {
			isPrecise: false,
			isExact: false,
			normalizedAnchor: { x: 0.5, y: 0.5 },
		}
	}

	// when the binding itself changes
	override onAfterCreate({ binding }: BindingOnCreateOptions<TLThreadBinding>): void {
		threadDidUpdate(this.editor, this.editor.getShape(binding.fromId) as TLThreadShape)
	}

	// when the binding itself changes
	override onAfterChange({ bindingAfter }: BindingOnChangeOptions<TLThreadBinding>): void {
		threadDidUpdate(this.editor, this.editor.getShape(bindingAfter.fromId) as TLThreadShape)
	}

	// when the shape an thread is bound to changes
	override onAfterChangeToShape({ binding }: BindingOnShapeChangeOptions<TLThreadBinding>): void {
		reparentThread(this.editor, binding.fromId)
	}

	// when the thread itself changes
	override onAfterChangeFromShape({ shapeAfter }: BindingOnShapeChangeOptions<TLThreadBinding>): void {
		threadDidUpdate(this.editor, shapeAfter as TLThreadShape)
	}

	// when the thread is isolated we need to update it's x,y positions
	override onBeforeIsolateFromShape({
		binding,
	}: BindingOnShapeIsolateOptions<TLThreadBinding>): void {
		const thread = this.editor.getShape<TLThreadShape>(binding.fromId)
		if (!thread) return
		updateThreadTerminal({
			editor: this.editor,
			thread,
			terminal: binding.props.terminal,
		})
	}

	private updateThreadBinding(binding: TLThreadBinding) {
		const startShape = this.editor.getShape(binding.fromId);
		const endShape = this.editor.getShape(binding.toId);

		if (startShape && endShape) {
			const { startAnchor, startIsExact, startIsPrecise, endAnchor, endIsExact, endIsPrecise } = calculateAnchor(startShape, endShape);

			this.editor.updateBinding({
				id: binding.id,
				type: 'thread',
				props: {
					...binding.props,
					isExact: startIsExact,
					isPrecise: startIsPrecise,
					normalizedAnchor: startAnchor,
				}
			});

			this.editor.updateBinding({
				id: binding.id,
				type: 'thread',
				props: {
					...binding.props,
					isExact: endIsExact,
					isPrecise: endIsPrecise,
					normalizedAnchor: endAnchor,
				}
			});
		}
	}
}

function reparentThread(editor: Editor, threadId: TLShapeId) {
	const thread = editor.getShape<TLThreadShape>(threadId)
	if (!thread) return
	const bindings = getThreadBindings(editor, thread)
	const { start, end } = bindings
	const startShape = start ? editor.getShape(start.toId) : undefined
	const endShape = end ? editor.getShape(end.toId) : undefined

	const parentPageId = editor.getAncestorPageId(thread)
	if (!parentPageId) return

	let nextParentId: TLParentId
	if (startShape && endShape) {
		// if thread has two bindings, always parent thread to closest common ancestor of the bindings
		nextParentId = editor.findCommonAncestor([startShape, endShape]) ?? parentPageId
	} else if (startShape || endShape) {
		const bindingParentId = (startShape || endShape)?.parentId
		// If the thread and the shape that it is bound to have the same parent, then keep that parent
		if (bindingParentId && bindingParentId === thread.parentId) {
			nextParentId = thread.parentId
		} else {
			// if thread has one binding, keep thread on its own page
			nextParentId = parentPageId
		}
	} else {
		return
	}

	if (nextParentId && nextParentId !== thread.parentId) {
		editor.reparentShapes([threadId], nextParentId)
	}

	const reparentedThread = editor.getShape<TLThreadShape>(threadId)
	if (!reparentedThread) throw Error('no reparented thread')

	const startSibling = (editor as any).getShapeNearestSibling(reparentedThread, startShape)
	const endSibling = (editor as any).getShapeNearestSibling(reparentedThread, endShape)

	let highestSibling: TLShape

	if (startSibling && endSibling) {
		highestSibling = startSibling.index > endSibling.index ? startSibling : endSibling
	} else if (startSibling && !endSibling) {
		highestSibling = startSibling
	} else if (endSibling && !startSibling) {
		highestSibling = endSibling
	} else {
		return
	}

	let finalIndex: IndexKey

	const higherSiblings = editor
		.getSortedChildIdsForParent((highestSibling).parentId)
		.map((id) => editor.getShape(id)!)
		.filter((sibling) => sibling.index > highestSibling!.index)

	if (higherSiblings.length) {
		// there are siblings above the highest bound sibling, we need to
		// insert between them.

		// if the next sibling is also a bound thread though, we can end up
		// all fighting for the same indexes. so lets find the next
		// non-thread sibling...
		const nextHighestNonThreadSibling = higherSiblings.find((sibling) => sibling.type !== 'thread')

		if (
			// ...then, if we're above the last shape we want to be above...
			reparentedThread.index > highestSibling.index &&
			// ...but below the next non-thread sibling...
			(!nextHighestNonThreadSibling || reparentedThread.index < nextHighestNonThreadSibling.index)
		) {
			// ...then we're already in the right place. no need to update!
			return
		}

		// otherwise, we need to find the index between the highest sibling
		// we want to be above, and the next highest sibling we want to be
		// below:
		finalIndex = getIndexBetween(highestSibling.index, higherSiblings[0].index)
	} else {
		// if there are no siblings above us, we can just get the next index:
		finalIndex = getIndexAbove(highestSibling.index)
	}

	if (finalIndex !== reparentedThread.index) {
		editor.updateShapes<TLThreadShape>([{ id: threadId, type: 'thread', index: finalIndex }])
	}
}

function threadDidUpdate(editor: Editor, thread: TLThreadShape) {
	const bindings = getThreadBindings(editor, thread)
	// if the shape is an thread and its bound shape is on another page
	// or was deleted, unbind it
	for (const handle of ['start', 'end'] as const) {
		const binding = bindings[handle]
		if (!binding) continue
		const boundShape = editor.getShape(binding.toId)
		const isShapeInSamePageAsThread =
			editor.getAncestorPageId(thread) === editor.getAncestorPageId(boundShape)
		if (!boundShape || !isShapeInSamePageAsThread) {
			updateThreadTerminal({ editor, thread, terminal: handle, unbind: true })
		}
	}

	// always check the thread parents
	reparentThread(editor, thread.id)
}

/** @internal */
export function updateThreadTerminal({
	editor,
	thread,
	terminal,
	unbind = false,
	useHandle = false,
}: {
	editor: Editor
	thread: TLThreadShape
	terminal: 'start' | 'end'
	unbind?: boolean
	useHandle?: boolean
}) {
	const info = getThreadInfo(editor, thread)
	if (!info) {
		throw new Error('expected thread info')
	}

	const startPoint = useHandle ? info.start.handle : info.start.point
	const endPoint = useHandle ? info.end.handle : info.end.point
	const point = terminal === 'start' ? startPoint : endPoint

	const update = {
		id: thread.id,
		type: 'thread',
		props: {
			[terminal]: { x: point.x, y: point.y },
			bend: thread.props.bend,
		},
	} satisfies TLShapePartial<TLThreadShape>

	// fix up the bend:
	if (!info.isStraight) {
		// find the new start/end points of the resulting thread
		const newStart = terminal === 'start' ? startPoint : info.start.handle
		const newEnd = terminal === 'end' ? endPoint : info.end.handle
		const newMidPoint = Vec.Med(newStart, newEnd)

		// intersect a line segment perpendicular to the new thread with the old thread arc to
		// find the new mid-point
		const lineSegment = Vec.Sub(newStart, newEnd)
			.per()
			.uni()
			.mul(info.handleArc.radius * 2 * Math.sign(thread.props.bend))

		// find the intersections with the old thread arc:
		const intersections = intersectLineSegmentCircle(
			info.handleArc.center,
			Vec.Add(newMidPoint, lineSegment),
			info.handleArc.center,
			info.handleArc.radius
		)

		assert(intersections?.length === 1)
		// @ts-ignore
		const bend = Vec.Dist(newMidPoint, intersections[0]) * Math.sign(thread.props.bend)
		// use `approximately` to avoid endless update loops
		if (!approximately(bend, update.props.bend)) {
			update.props.bend = bend
		}
	}

	editor.updateShape(update)
	if (unbind) {
		removeThreadBinding(editor, thread, terminal)
	}
}