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
        shapeBefore,
		shapeAfter,
	}: any): void {


        // console.log("CHANGE TO SHAPE!")
		const annotation = this.editor.getShape(binding.fromId)!

		const boundShape: any = this.editor.getShape(binding.toId)!

        // translate the annotation's position by the amound that the shape has moved
		this.editor.updateShape({
			id: annotation.id,
			type: 'annotation',
			x: annotation.x + (shapeAfter.x - shapeBefore.x),
			y: annotation.y + (shapeAfter.y - shapeBefore.y),
		})

        // we need to be tracking the update of the position of the tiptap node to which the annotation is attached -- that means we need access 
        // the editor from with this method

        //-

	}
    
    override onAfterChangeFromShape({
		binding,
        shapeBefore,
		shapeAfter,
	}: any): void {

        // const annotations = this.editor.getCurrentPageShapes().filter(shape => shape.type === 'annotation');
        // for(let annotation of annotations){
        //     while (shapeAfter.x < annotation.x + annotation.props.w &&
        //         shapeAfter.x + shapeAfter.props.w > annotation.x &&
        //         shapeAfter.y < annotation.y + annotation.props.h &&
        //         shapeAfter.y + shapeAfter.props.h > annotation.y) {
                
        //         this.editor.updateShape({
        //             id: annotation.id,
        //             type: 'annotation',
        //             y: annotation.y + 10,
        //         });
        //     }

        // }
    }

	// when the thing we're stuck to is deleted, delete the annotation too
	override onBeforeDeleteToShape({ binding }: BindingOnShapeDeleteOptions<AnnotationModelBinding>): void {
		this.editor.deleteShape(binding.fromId)
	}
}