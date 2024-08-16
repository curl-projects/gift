export function generatePointsAroundCircle(centerX, centerY, radius, numPoints, stochasticFactor) {
    const points = [];
    const angleStep = (2 * Math.PI) / numPoints;

    for (let i = 0; i < numPoints; i++) {
        const angle = i * angleStep;
        const stochasticRadius = radius + (Math.random() - 0.5) * stochasticFactor;
        const x = centerX + stochasticRadius * Math.cos(angle);
        const y = centerY + stochasticRadius * Math.sin(angle);
        points.push({ x, y });
    }

    return points;
}

// apply a progressive blur
export function applyProgressiveBlur(editor, centralShape, excludeIds = []){
    // get all shapes
    
    const shapes = editor.getCurrentPageShapes();
    // exclude those in excludeIds

    console.log("APPLYING PROGRESSIVE BLUR:", centralShape, excludeIds, shapes)

    const shapesToBlur = shapes.filter(shape => !excludeIds.includes(shape.id) && shape.id !== centralShape.id);
    // based on their distance from the existing shape, determine their blur 
    function calculateCenter(shape){
        if(shape.type === "thread"){
            const shapeX = shape.x + (shape.props.start.x / 2);
            const shapeY = shape.y + (shape.props.start.y / 2);
            return [shapeX, shapeY]
        }
        const shapeX = shape.x + (shape.props.w / 2);
        const shapeY = shape.y + (shape.props.h / 2);

        return [shapeX, shapeY]
    }

    const centralShapeCenter = calculateCenter(centralShape);
    const canvas = editor.getContainer(); // Assuming the canvas has an id of 'canvas'
    const maxDistance = Math.sqrt(Math.pow(canvas.clientWidth, 2) + Math.pow(canvas.clientHeight, 2));

    for(let shape of shapesToBlur){
        const shapeCenter = calculateCenter(shape);
        const distance = Math.sqrt(Math.pow(shapeCenter[0] - centralShapeCenter[0], 2) + Math.pow(shapeCenter[1] - centralShapeCenter[1], 2));

        const opacity = Math.min(0.3, (distance / maxDistance) * 0.5);
        
        editor.updateShape({
            id: shape.id,
            type: shape.type,
            opacity: 0.2
        })
    }
}

export function removeProgressiveBlur(editor, centralShape, excludeIds = []){
    console.log("REMOVE BLUR")
    // get all shapes
    const shapes = editor.getCurrentPageShapes();
    // exclude those in excludeIds
    for(let shape of shapes){
        if(['concept', 'thread', 'excerpt', 'geo', 'name'].includes(shape.type) ){
            editor.updateShape({
                id: shape.id,
                type: shape.type,
                opacity: 1
            })
        }
    }
    
    // const shapesToReset = shapes.filter(shape => !excludeIds.includes(shape.id) && shape.id !== centralShape.id);


    // for(let shape of shapesToReset){
    //     editor.updateShape({
    //         id: shape.id,
    //         type: shape.type,
    //         opacity: 1
    //     })
    // }
}