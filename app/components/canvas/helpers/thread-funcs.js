import { createShapeId, stopEventPropagation } from "tldraw";
import { generatePointsAroundCircle } from "./distribution-funcs";

export function calculateAnchor(startShape=null, endShape=null) {
    let startAnchor = { x: 0, y: 0 };
    let startIsExact = false;
    let startIsPrecise = false;

    let endAnchor = { x: 0, y: 0 };
    let endIsExact = false;
    let endIsPrecise = false;

    if (startShape?.type === 'name') {
        startIsPrecise = true;
        startIsExact = true;
        startAnchor = { x: 0.5, y: 0.5 };
    } else if (startShape?.type === 'concept') {
        startIsPrecise = true;
        startIsExact = true;
        startAnchor = { x: (56/2) / startShape.props.w, y: (56 / 2 ) / startShape.props.h };
    }

    if (endShape?.type === 'concept') {
        endIsPrecise = true;
        endIsExact = true;
        endAnchor = { x: (56/2) / endShape.props.w, y: (56 / 2 ) / endShape.props.h };
    }
    else if(endShape?.type === 'excerpt'){
        endIsPrecise = true;
        endIsExact = true;
        endAnchor = { x: Math.max(6.5 / endShape.props.w, 0), y: Math.max(12.7 / endShape.props.h, 0) };

    }
    else if(endShape?.type === 'name'){
        endIsPrecise = true;
        endIsExact = true;
        endAnchor = { x: 0.5, y: 0.5 };
    }

    return { startAnchor, startIsExact, startIsPrecise, endAnchor, endIsExact, endIsPrecise };
}

export function createBoundThread(editor, startShapeId, endShapeId) {
    if (!hasExistingThread(editor, startShapeId, endShapeId)) {
        const startShape = editor.getShape(startShapeId);
        const endShape = editor.getShape(endShapeId);

        if (!startShape || !endShape) {
            console.error("Invalid shape IDs provided.");
            return null;
        }

        const { startAnchor, startIsExact, startIsPrecise, endAnchor, endIsExact, endIsPrecise } = calculateAnchor(startShape, endShape);

        const threadId = createShapeId();
        editor.createShape({
            id: threadId,
            type: "thread",
            props: {
                threadheadStart: "none",
                threadheadEnd: "none"
            }
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
        ]);

        return threadId;
    }

    return null;
}

function hasExistingThread(editor, startShapeId, endShapeId) {
    const bindings = editor.getBindingsToShape(startShapeId, 'thread');
    for (let binding of bindings) {
        let threadBindings = editor.getBindingsFromShape(binding.fromId, 'thread');
        for (let threadBinding of threadBindings) {
            if (threadBinding.toId === endShapeId) {
                return true;
            }
        }
    }

    return false;
}

export function generateExcerpts(editor, concept) {
    if (concept.excerpts) {
        const conceptShape = editor.getShape(createShapeId(concept.id));
        if (!conceptShape) {
            console.error("Concept shape not found.");
            return;
        }

        const { x: centerX, y: centerY } = conceptShape;
        const points = generatePointsAroundCircle(centerX, centerY, 200, concept.excerpts.length, 0);

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

                createBoundThread(editor, createShapeId(concept.id), createShapeId(excerpt.id));

            }
        }
    } else {
        console.warn("No excerpts found");
    }
}

export function tearDownExcerpts(editor, concept) {
    if (concept.excerpts) {
        const excerptIds = concept.excerpts.map(excerpt => createShapeId(excerpt.id));

        const threadIds = excerptIds.map(excerptId => {
            const threadBindings = editor.getBindingsToShape(excerptId, 'thread');
            return threadBindings.map(threadBinding => threadBinding.fromId);
        }).flat();

        // delete threads
        editor.deleteShapes(threadIds);

        // delete excerpts
        editor.deleteShapes(excerptIds);
    }
}

export function tearDownAllExcerpts(editor){
    const allExcerpts = editor.getShapes('excerpt');

    const threadIds = allExcerpts(excerpt => {
        const threadBindings = editor.getBindingsToShape(excerpt.id, 'thread');
        return threadBindings.map(threadBinding => threadBinding.fromId);
    })

    editor.deleteShapes(allExcerpts);
    editor.deleteShapes(threadIds);
}

export function excerptsExist(editor, concept){
    const excerptIds = concept.excerpts.map(excerpt => createShapeId(excerpt.id));

    console.log("EXCERPT IDS:", excerptIds)
    const excerptShapes = excerptIds.map(id => editor.getShape(id)).filter(shape => shape !== undefined);
    console.log("EXCERPT SHAPES:", excerptShapes)

    return excerptShapes.length === concept.excerpts.length;
}