import { useEffect, useState, useRef } from 'react';
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

const createDriftShape = (editor, excerpt, existingShapes) => {
    const id = createShapeId(`drift-${excerpt.id}-${Math.random()}`);
    const shapeWidth = 450;
    const shapeHeight = calculateHeightBasedOnContent(excerpt.content);

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const exclusionZone = 50; // Half of 100px

    let randomX, randomY;
    let isOverlapping;

    do {
        randomX = Math.random() * (window.innerWidth - shapeWidth);
        randomY = Math.random() * (window.innerHeight - shapeHeight);

        isOverlapping = existingShapes.some(shape => {
            return (
                randomX < shape.x + shape.width &&
                randomX + shapeWidth > shape.x &&
                randomY < shape.y + shape.height &&
                randomY + shapeHeight > shape.y
            );
        });
    } while (
        (randomX > centerX - exclusionZone - shapeWidth &&
        randomX < centerX + exclusionZone &&
        randomY > centerY - exclusionZone - shapeHeight &&
        randomY < centerY + exclusionZone) || isOverlapping
    );

    editor.createShape({
        id: id,
        type: 'drift',
        x: editor.screenToPage({ x: randomX, y: 0 }).x,
        y: editor.screenToPage({ x: 0, y: randomY }).y,
        props: {
            type: 'excerpt',
            text: excerpt.content,
            parentDatabaseId: excerpt.id,
        }
    });

    existingShapes.push({ x: randomX, y: randomY, width: shapeWidth, height: shapeHeight });

    return id;
}


export function DriftPainter({ user }){
    const editor = useEditor();
    const { drifting } = useConstellationMode();
    const timeouts = useRef([]);

    useEffect(()=>{
        if(drifting){
            const excerpts = user.concepts.flatMap(concept => concept.excerpts);

            const shuffledExcerpts = shuffleArray([...excerpts]);
            const selectedExcerpts = shuffledExcerpts.slice(0, 5);

            const existingShapes = [];

            const createAndReplaceShape = (excerpt, index) => {
                console.log("CREATING DRIFT")
                const randomTimeout = Math.random() * 15000 + 5000; // Random time between 5s and 10s
                const shapeId = createDriftShape(editor, excerpt, existingShapes);
                
                const timeoutId = setTimeout(() => {
                    // delete shape
                    editor.updateShape({id: shapeId, type: "drift", props: {triggerDelete: true}});
 
                    // wait until delete animation has played
                    const deleteTimeoutId = setTimeout(()=>{
                        const newExcerpt = excerpts[Math.floor(Math.random() * excerpts.length)];
                        createAndReplaceShape(newExcerpt, index);
                    }, 4100);
                    timeouts.current.push(deleteTimeoutId);
                    
                }, randomTimeout);
                timeouts.current.push(timeoutId);
        
            };

            selectedExcerpts.forEach((excerpt, index) => {
                const randomDelay = Math.random() * 3000; // Random delay up to 5 seconds
                const delayTimeoutId = setTimeout(() => {
                    createAndReplaceShape(excerpt, index);
                }, randomDelay);
                timeouts.current.push(delayTimeoutId);
            });
        }

        return () => {
            timeouts.current.forEach(clearTimeout);
            timeouts.current = [];
            const drifts = editor.getCurrentPageShapes().filter(shape => shape.type === "drift");
            drifts.forEach(drift => {
                editor.updateShape({id: drift.id, type: "drift", props: {triggerDelete: true}})
            });
        };
    }, [drifting]);

    return null;
}