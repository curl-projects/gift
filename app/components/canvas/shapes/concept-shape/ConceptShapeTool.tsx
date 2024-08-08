import { StateNode, BaseBoxShapeTool, TLStateNodeConstructor } from '@tldraw/editor'

/** @public */
export class ConceptShapeTool extends BaseBoxShapeTool {
	static override id = 'concept'
	static override initial = 'idle'
	override shapeType = 'concept'
}