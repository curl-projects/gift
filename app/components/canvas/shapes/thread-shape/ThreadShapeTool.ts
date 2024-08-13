import { StateNode, TLStateNodeConstructor } from '@tldraw/editor'
import { Idle } from './toolStates/Idle'
import { Pointing } from './toolStates/Pointing'

/** @public */
export class ThreadShapeTool extends StateNode {
	static override id = 'thread'
	static override initial = 'idle'
	static override children(): TLStateNodeConstructor[] {
		return [Idle, Pointing]
	}

	override shapeType = 'thread'
}