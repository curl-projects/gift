import { createShapeId } from "tldraw";

export function createBoundArrow(editor, startShapeId, endShapeId){
    if(!hasExistingArrow(editor, startShapeId, endShapeId)){
        const arrowId = createShapeId();
        editor.createShape({
            id: arrowId,
            type: "arrow"
        }).createBindings([
            {
                fromId: arrowId,
                toId: startShapeId,
                type: 'arrow',
                props: {
                    terminal: 'start',
                    isExact: false,
                    isPrecise: false
                }
            },
            {
                fromId: arrowId,
                toId: endShapeId,
                type: 'arrow',
                props: {
                    terminal: 'end',
                    isExact: false,
                    isPrecise: false
                }
            }
        ])
        
        return arrowId    
    }

    return null
    
}

function hasExistingArrow(editor, startShapeId, endShapeId){
    const bindings = editor.getBindingsToShape(startShapeId, 'arrow')
    for(let binding of bindings){
        let arrowBindings = editor.getBindingsFromShape(binding.fromId, 'arrow')
        for(let arrowBinding of arrowBindings){
            if(arrowBinding.toId === endShapeId){
                return true
            }
        }
    }

    return false
}

export function generateExcerpts(editor, concept){
    if(concept.excerpts){
        for(let excerpt of concept.excerpts){
            editor.createShape({
                id: createShapeId(excerpt.id),
                type: "excerpt",
                props: {
                    text: excerpt.content,
                    databaseId: excerpt.id
                }
            })
            createBoundArrow(editor, createShapeId(concept.id), createShapeId(excerpt.id))

        }
    }
    else{
        console.warn("No excerpts found")
    }
}

export function tearDownExcerpts(editor, concept){
    // get all excerpts that exist
    if(concept.excerpts){
        const excerptIds = concept.excerpts.map(excerpt => createShapeId(excerpt.id))

        const arrowIds = excerptIds.map(excerptId => {
            const arrowBindings = editor.getBindingsToShape(excerptId, 'arrow')
            return arrowBindings.map(arrowBinding => arrowBinding.fromId)
        }).flat();

        // console.log("ARROW IDS:", arrowIds)
        // console.log("EXCERPT IDS:", excerptIds)
        // delete arrows
        editor.deleteShapes(arrowIds)

        // delete excerpts
        editor.deleteShapes(excerptIds)    
    }
    
}