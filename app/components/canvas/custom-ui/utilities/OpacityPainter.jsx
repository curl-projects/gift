import { useEditor } from "tldraw"
import { useEffect } from "react"
import { useStarFireSync } from "~/components/synchronization/StarFireSync"
import { animateShapeProperties } from "~/components/canvas/helpers/animation-funcs"

export function OpacityPainter(){
    const editor = useEditor()
    const { journalMode, conceptIsDragging, minimapMode } = useStarFireSync()

    useEffect(()=>{
        const shapes = editor.getCurrentPageShapes().filter(shape => ['concept', 'name', "excerpt"].includes(shape.type))

        if(journalMode.active){
            console.log("JOURNAL ACTIVE", journalMode)
            if(journalMode.page === 'article'){
                // everything except the article shape disappears
                const activeMedia = shapes.find(shape => shape.props.media && shape.props.media?.content === journalMode.content)

                // find the shape that has content matching the journalMode.content
                const blurShapes = shapes.filter(shape => shape.id !== activeMedia?.id)
                
                for(let shape of blurShapes){
                    animateShapeProperties(editor, shape.id, {opacity: 0.1}, 300, t => t * (2 - t))
                }
            }
            else if(journalMode.page === 'entries'){
                for(let shape of shapes){
                    animateShapeProperties(editor, shape.id, {opacity: 0.1}, 300, t => t * (2 - t))
                }
            }
            else{
                    for(let shape of shapes){
                        animateShapeProperties(editor, shape.id, {opacity: 0.1}, 300, t => t * (2 - t))
                    }
            }
            
        }
        else if(conceptIsDragging.active){
            const blurShapes = shapes.filter(shape => shape.id !== conceptIsDragging.id)
            for(let shape of blurShapes){
                animateShapeProperties(editor, shape.id, {opacity: 0.3}, 100, t => t * (2 - t))
            }
        }
        else if(minimapMode.hovered){
            for(let shape of shapes){
                animateShapeProperties(editor, shape.id, {opacity: 0.1}, 300, t => t * (2 - t))
            }
        }
        else{
            for(let shape of shapes){
                animateShapeProperties(editor, shape.id, {opacity: 1}, 300, t => t * (2 - t))
            }
        }
    }, [journalMode, conceptIsDragging, minimapMode])

    return null
}

