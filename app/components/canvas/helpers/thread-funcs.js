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
        console.log("H:", endShape.props.h)
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
        console.log("START SHAPE TYPE:", startShape.type, "END SHAPE TYPE:", endShape.type)
        console.log("START ANCHOR:", startAnchor, "END ANCHOR:", endAnchor)

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

export function hasExistingThread(editor, startShapeId, endShapeId) {
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

export function deleteAssociatedThreads(editor, shapeId){
    const threadBindings = editor.getBindingsToShape(shapeId, 'thread');
    const threadIds = threadBindings.map(threadBinding => threadBinding.fromId);
    editor.deleteShapes(threadIds);
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

    const threadIds = allExcerpts.map(excerpt => {
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

export function conceptsExist(editor, concepts) {
    const conceptIds = concepts.map(concept => createShapeId(concept.id));

    console.log("CONCEPT IDS:", conceptIds);
    const conceptShapes = conceptIds.map(id => editor.getShape(id)).filter(shape => shape !== undefined);
    console.log("CONCEPT SHAPES:", conceptShapes);

    return conceptShapes.length === concepts.length;
}

export function generateConcepts(editor, centralShapeId, concepts) {
    if (concepts && concepts.length > 0) {
        const points = generatePointsAroundCircle(0, 0, 300, concepts.length, 0);

        for (let i = 0; i < concepts.length; i++) {
            const concept = concepts[i];
            const conceptShape = editor.getShape(createShapeId(concept.id));
            const { x, y } = points[i];
            let conceptShapeId = createShapeId(concept.id)
            if (!conceptShape) {
                editor.createShape({
                    id: conceptShapeId,
                    type: "concept",
                    x: x,
                    y: y,
                    props: {
                        text: concept.title,
                        plainText: concept.title,
                        description: concept.description,
                        databaseId: concept.id,
                    }
                });

                createBoundThread(editor, centralShapeId, conceptShapeId)
            }
        }
    } else {
        console.warn("No concepts found");
    }
}

export function generateConceptLinks(editor, concepts){
    for(let concept of concepts){
        for(let linkedConcept of concept.linkedEnd){
            if(!hasExistingThread(editor, createShapeId(concept.id), createShapeId(linkedConcept.linkedStart.id))){
                createBoundThread(editor, createShapeId(concept.id), createShapeId(linkedConcept.linkedStart.id))
            }
        }
    }
}

export function getChainToShape(data, databaseShapeId) {
    function findPath(data, targetId, path = []) {
        if (Array.isArray(data)) {
            for (const item of data) {
                const result = findPath(item, targetId, path);
                if (result) {
                    return result;
                }
            }
        } else if (typeof data === 'object' && data !== null) {
            if (data.id === targetId || data.uniqueName === targetId) {
                return [...path, data.id || data.uniqueName];
            }
            for (const key in data) {
                const result = findPath(data[key], targetId, [...path, data.id || data.uniqueName]);
                if (result) {
                    return result;
                }
            }
        }
        return null;
    }

    return findPath(data, databaseShapeId);
}