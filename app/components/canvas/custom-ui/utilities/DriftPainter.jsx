import { useEffect, useState } from 'react';
import { createShapeId, useEditor } from 'tldraw';
import { useConstellationMode } from '~/components/canvas/custom-ui/utilities/ConstellationModeContext';

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const createDriftShape = (editor, excerpt, selfDestructTime) => {
    const id = createShapeId(`drift-${excerpt.id}`)

    console.log("EXCERPT:", excerpt)

    editor.createShape({
        id: id,
        type: 'drift',
        x: editor.screenToPage({ x: Math.random() * window.innerWidth, y: 0 }).x,
        y: editor.screenToPage({ x: 0, y: Math.random() * window.innerHeight }).y,
        props: {
            type: 'excerpt',
            text: excerpt.content,
            selfDestructTime: selfDestructTime
        }
    })

    return id
}

export function DriftPainter({ user }){
    const editor = useEditor();
    const { drifting } = useConstellationMode();
    const [driftShapeIds, setDriftShapeIds] = useState([]);

    useEffect(()=>{
        if(drifting){
            const excerpts = user.concepts.flatMap(concept => concept.excerpts);

            const createAndReplaceShape = (excerpt, index) => {
                const randomTimeout = Math.random() * 5000 + 5000; // Random time between 5s and 10s
                const shapeId = createDriftShape(editor, excerpt, randomTimeout);

                setTimeout(() => {
                    const newExcerpt = excerpts[Math.floor(Math.random() * excerpts.length)];
                    createAndReplaceShape(newExcerpt, index);
                }, randomTimeout);

                setDriftShapeIds((prevShapeIds) => {
                    const newShapeIds = [...prevShapeIds];
                    newShapeIds[index] = shapeId;
                    return newShapeIds;
                });
            };

            const shuffledExcerpts = shuffleArray([...excerpts]);
            const selectedExcerpts = shuffledExcerpts.slice(0, 5);

            selectedExcerpts.forEach((excerpt, index) => {
                createAndReplaceShape(excerpt, index);
            });
        }

        return () => {
            driftShapeIds.forEach(shapeId => {
                editor.deleteShape({id: shapeId, type: "drift"})
            });
        };
    }, [drifting, user, editor]);

    return null;
}