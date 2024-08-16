import { StateNode, BaseBoxShapeTool, TLStateNodeConstructor } from '@tldraw/editor'

/** @public */
export class NameShapeTool extends BaseBoxShapeTool {
	static override id = 'name'
	static override initial = 'idle'
	override shapeType = 'name'
}