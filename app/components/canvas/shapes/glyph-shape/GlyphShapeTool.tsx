import { StateNode, BaseBoxShapeTool, TLStateNodeConstructor } from '@tldraw/editor'

/** @public */
export class GlyphShapeTool extends BaseBoxShapeTool {
	static override id = 'glyph'
	static override initial = 'idle'
	override shapeType = 'glyph'
}