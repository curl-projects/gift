import { StateNode, BaseBoxShapeTool, TLStateNodeConstructor } from '@tldraw/editor'

/** @public */
export class ExcerptShapeTool extends BaseBoxShapeTool {
	static override id = 'excerpt'
	static override initial = 'idle'
	override shapeType = 'excerpt'
}