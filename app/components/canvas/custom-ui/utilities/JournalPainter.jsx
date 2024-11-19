import { useEditor, createShapeId } from "tldraw"
import { useEffect } from "react"
import { useStarFireSync } from "~/components/synchronization/StarFireSync"
import { journalRightOffset, journalLeftOffset } from "~/components/canvas/shapes/journal-shape/JournalShapeUtil"

export function JournalPainter(){
    const editor = useEditor()
    const { journalMode } = useStarFireSync()

    useEffect(()=>{
        console.log("journalMode", journalMode)
    }, [journalMode])


    useEffect(()=>{
        const shapes = editor.getCurrentPageShapes().filter(shape => ['concept', 'name', "excerpt"].includes(shape.type))

        if(journalMode.active){
            if(journalMode.page === 'article'){
                // everything except the article shape disappears
                const activeMedia = shapes.find(shape => shape.props.media && shape.props.media?.content === journalMode.content)

                // find the shape that has content matching the journalMode.content
                const blurShapes = shapes.filter(shape => shape.id !== activeMedia?.id)
                
                editor.run(() => {
                    editor.updateShapes(blurShapes.map(shape => ({...shape, opacity: 0.2})))
                }, { ignoreShapeLock: true })
            }
            
        }
        else{
            // restore shape opacity 
            editor.run(() => {
                shapes.forEach(shape => {
                    editor.updateShape({...shape, opacity: 1})
                })
            }, { ignoreShapeLock: true })
        }
    }, [journalMode])

    
    useEffect(()=>{
        const journal = editor.getShape({type: 'journal', id: createShapeId('journal')})

        if(journalMode.active){
            if(journal){
                editor.updateShape({
                    type: "journal",
                    id: createShapeId('journal'),
                    props: {
                        expanded: true,
                        page: journalMode.page || 'cover',
                    }
                })
            }
            else{
                const margin = window.innerHeight * 0.1;
                const offset = journalMode.position === 'left' ? window.innerWidth * journalLeftOffset : window.innerWidth * journalRightOffset
                const { x, y } = editor.screenToPage({x: offset - margin, y: margin})
    
                editor.createShape({
                    type: "journal",
                    id: createShapeId('journal'),
                    x: x,
                    y: y,
                    props: {
                        expanded: true,
                        page: journalMode.page || 'cover',
                    }
                })
            }
        }
        else{
            if(journal){
                editor.updateShape({
                    type: "journal",
                    id: createShapeId('journal'),
                    props: {
                        expanded: false,
                    }
                }) 
            }
        }

    }, [journalMode])
}
