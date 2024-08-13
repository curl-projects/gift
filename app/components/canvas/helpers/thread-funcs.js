import { createShapeId, stopEventPropagation } from "tldraw";
import { generatePointsAroundCircle } from "./distribution-funcs";

export function createBoundThread(editor, startShapeId, endShapeId){
    if(!hasExistingThread(editor, startShapeId, endShapeId)){
        const startShape = editor.getShape(startShapeId)
        const endShape = editor.getShape(endShapeId)


        var startAnchor = {x: 0, y: 0}
        var startIsExact = false
        var startIsPrecise = false
    
        var endAnchor = {x: 0, y: 0}
        var endIsExact = false
        var endIsPrecise = false

        function calculateAnchor(startShape, endShape){
            if(startShape.type === 'geo'){
                startIsPrecise = false
                startIsExact = false
            }
            else if(startShape.type === 'concept'){
                startIsPrecise = true
                startIsExact = true
                startAnchor = {x: 0.16, y: 0.49}

                console.log("START ANCHOR:", startAnchor, startShape.props.w, startShape.props.h)
            }

            if(endShape.type === 'concept'){
                endIsPrecise = true
                endIsExact = true
                endAnchor = {x: 0.15, y: 0.47}
            }
        }

        calculateAnchor(startShape, endShape)

        const threadId = createShapeId();
        editor.createShape({
            id: threadId,
            type: "thread"
        }).createBindings([
            {
                fromId: threadId,
                toId: startShapeId,
                type: 'thread',
                props: {
                    terminal: 'start',
                    isExact: startIsExact,
                    isPrecise: startIsPrecise,
                    normalizedAnchor: startAnchor,
                }
            },
            {
                fromId: threadId,
                toId: endShapeId,
                type: 'thread',
                props: {
                    terminal: 'end',
                    isExact: endIsExact,
                    isPrecise: endIsPrecise,
                    normalizedAnchor: endAnchor,
                }
            }
        ])
        
        return threadId    
    }

    return null
    
}

function hasExistingThread(editor, startShapeId, endShapeId){
    const bindings = editor.getBindingsToShape(startShapeId, 'thread')
    for(let binding of bindings){
        let threadBindings = editor.getBindingsFromShape(binding.fromId, 'thread')
        for(let threadBinding of threadBindings){
            if(threadBinding.toId === endShapeId){
                return true
            }
        }
    }

    return false
}

export function generateExcerpts(editor, concept) {
    if (concept.excerpts) {
        const conceptShape = editor.getShape(createShapeId(concept.id));
        const { x: centerX, y: centerY } = conceptShape;

        const points = generatePointsAroundCircle(centerX, centerY, 200, concept.excerpts.length, 20);

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
                        text: excerpt.content,
                        plainText: excerpt.content,
                        databaseId: excerpt.id,
                      
                    }
                });

                // introduces them into the graph
                // createBoundThread(editor, createShapeId(concept.id), createShapeId(excerpt.id));
            }
        }

    } else {
        console.warn("No excerpts found");
    }
}

export function tearDownExcerpts(editor, concept){
    // get all excerpts that exist
    if(concept.excerpts){
        const excerptIds = concept.excerpts.map(excerpt => createShapeId(excerpt.id))
        
        const threadIds = excerptIds.map(excerptId => {
            const threadBindings = editor.getBindingsToShape(excerptId, 'thread')
            return threadBindings.map(threadBinding => threadBinding.fromId)
        }).flat();

        // delete threads
        editor.deleteShapes(threadIds)

        // delete excerpts
        editor.deleteShapes(excerptIds)    
    }
    
}