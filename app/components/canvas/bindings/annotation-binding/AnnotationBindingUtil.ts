import {
	BindingOnShapeChangeOptions,
	BindingOnShapeDeleteOptions,
	BindingUtil,
	Box,
	DefaultToolbar,
	DefaultToolbarContent,
	RecordProps,
	Rectangle2d,
	ShapeUtil,
	StateNode,
	TLBaseBinding,
	TLBaseShape,
	TLEventHandlers,
	TLOnTranslateEndHandler,
	TLOnTranslateStartHandler,
	TLUiComponents,
	TLUiOverrides,
	Tldraw,
	TldrawUiMenuItem,
	VecModel,
	createShapeId,
	invLerp,
	lerp,
	useIsToolSelected,
	useTools,
} from 'tldraw'

type AnnotationModelBinding = TLBaseBinding<'annotation', { anchor: VecModel }>

export class AnnotationBindingUtil extends BindingUtil<AnnotationModelBinding>{
	static override type = 'annotation' as const

	override getDefaultProps() {
		return {
			anchor: { x: 0, y: 0 },
		}
	}

	// when the shape we're stuck to changes, update the sticker's position
	override onAfterChangeToShape({
		binding,
		shapeAfter,
	}: any): void {

        // console.log("CHANGE TO SHAPE!")
		const annotation = this.editor.getShape(binding.fromId)!

		const boundShape: any = this.editor.getShape(binding.toId)!

		// this.editor.updateShape({
		// 	id: annotation.id,
		// 	type: 'annotation',
		// 	x: boundShape.x,
		// 	y: boundShape.y,
		// })

        // we need to be tracking the update of the position of the tiptap node to which the annotation is attached\

	}

	// when the thing we're stuck to is deleted, delete the sticker too
	override onBeforeDeleteToShape({ binding }: BindingOnShapeDeleteOptions<AnnotationModelBinding>): void {
		this.editor.deleteShape(binding.fromId)
	}
}