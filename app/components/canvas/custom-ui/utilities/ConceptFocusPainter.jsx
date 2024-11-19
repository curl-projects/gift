import { useStarFireSync } from "~/components/synchronization/StarFireSync"
import { useEffect, useState } from "react"
import { useDataContext } from '~/components/synchronization/DataContext';
import { createShapeId, useEditor } from "tldraw"
import { generatePointsAroundCircle } from "~/components/canvas/helpers/distribution-funcs"

export function ConceptFocusPainter() {
    const { conceptList, setDrifting } = useStarFireSync()
    const { data } = useDataContext()
    const editor = useEditor()

    useEffect(() => {
        console.log("CONCEPT FOCUS PAINTER:", conceptList)
        if (conceptList.focusedConcept) {
            const excerpts = editor.getCurrentPageShapes().filter(shape => shape.type === 'excerpt')
            editor.run(()=>{
                editor.deleteShapes(excerpts.map(excerpt => excerpt.id))
            }, {ignoreShapeLock: true})
            

            setDrifting({active: false})
            const concept = data.user.concepts.find(concept => conceptList.focusedConcept === createShapeId(concept.id));
            const nameShape = editor.getShape(createShapeId(data.user.uniqueName))

            console.log("CONCEPT:", concept)
            if(concept){
                const points = generatePointsAroundCircle(nameShape.x, nameShape.y, 300, concept.excerpts.length, 20, 50, 20, 150);

                // get all articles and concepts associated with the concept id
                for (let i = 0; i < concept.excerpts.length; i++) {
                    const excerpt = concept.excerpts[i];
                    const excerptShape = editor.getShape(createShapeId(excerpt.id));
                    const { x, y } = points[i];
    
                    if (!excerptShape) {
                        editor.createShape({
                            id: createShapeId(excerpt.id),
                            type: "excerpt",
                            x: x,
                            y: y,
                            props: {
                                content: excerpt.content,
                                databaseId: excerpt.id,
                                media: excerpt.media,
                            }
                        });
                    }
                }
            }
        }
        else{
            const excerpts = editor.getCurrentPageShapes().filter(shape => shape.type === 'excerpt')
            editor.run(()=>{
                editor.deleteShapes(excerpts.map(excerpt => excerpt.id))
            }, {ignoreShapeLock: true})
        }
    }, [conceptList])

    return null
}