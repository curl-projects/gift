import { useEffect, useState } from 'react';
import { createShapeId, useEditor, Vec } from 'tldraw';
import { useConstellationMode } from '~/components/canvas/custom-ui/utilities/ConstellationModeContext';

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

// simulate the shape in order to determine its height
const calculateHeightBasedOnContent = (content) => {
    // Create a hidden div element
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.width = '400px'; // Fixed width for the shape
    div.style.fontSize = '14px'; // Ensure this matches the font size used in the shape
    div.style.lineHeight = '21px'; // Ensure this matches the line height used in the shape
    div.style.whiteSpace = 'pre-wrap'; // Ensure text wraps correctly
    div.innerText = content;

    // Append the div to the body to get its height
    document.body.appendChild(div);
    const height = div.offsetHeight;
    document.body.removeChild(div);

    return height;
};

// const customScreenToPage = (editor, point) => {
//     const { x: cx, y: cy, z: cz = 1 } = editor.getCamera();
//     return new Vec(
//         (point.x - editor.viewport.width / 2) / cz + cx,
//         (point.y - editor.viewport.height / 2) / cz + cy,
//         point.z ?? 1
//     );
// }

const createDriftShape = (editor, excerpt, selfDestructTime) => {
    const id = createShapeId(`drift-${excerpt.id}`);
    const shapeWidth = 400;
    const shapeHeight = calculateHeightBasedOnContent(excerpt.content); // You need to implement this function



    const randomX = Math.random() * (window.innerWidth - shapeWidth);
    const randomY = Math.random() * (window.innerHeight - shapeHeight);

    console.log("RANDOM:", randomX, randomY)
    console.log("RANDOM SCREEN:", editor.screenToPage({x: randomX, y: randomY}))
    console.log("WINDOW:", window.innerWidth, window.innerHeight)

    console.log("TEST:", editor.screenToPage({x: 0, y: 0}))
    console.log("TEST 2:", editor.pageToViewport({x: 0, y: 0}))
    // console.log("TEST 3:", customScreenToPage(editor, {x: 0, y: 0}))

    editor.createShape({
        id: id,
        type: 'drift',
        x: editor.screenToPage({ x: randomX, y: 0 }).x,
        y: editor.screenToPage({ x: 0, y: randomY }).y,
        props: {
            type: 'excerpt',
            text: excerpt.content,
            selfDestructTime: selfDestructTime
        }
    });

    return id;
}

export function DriftPainter({ user }){
    const editor = useEditor();
    const { drifting } = useConstellationMode();
    const [driftShapeIds, setDriftShapeIds] = useState([]);

    useEffect(()=>{
        if(drifting){
            const excerpts = user.concepts.flatMap(concept => concept.excerpts);

            const createAndReplaceShape = (excerpt, index) => {
                const randomTimeout = Math.random() * 50000 + 5000; // Random time between 50s and 55s
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
    }, [drifting]);

    return null;
}