import { createShapeId } from "tldraw";

export function generatePointsAroundCircle(centerX, centerY, radius, numPoints, stochasticFactor, itemWidth = 0, itemHeight = 0, radiusIncrement = radius) {

    console.log("GENERATING POINTS AROUND CIRCLES", centerX, centerY, radius, numPoints, stochasticFactor, itemWidth, itemHeight, radiusIncrement);

    const points = [];
    let totalPointsGenerated = 0;
    let circleNum = 0;
    const initialPointsPerCircle = 4;
    let previousPointsInCircle = initialPointsPerCircle;

    while (totalPointsGenerated < numPoints) {
        // Calculate the number of points for this circle
        let pointsInThisCircle = initialPointsPerCircle * Math.pow(2, circleNum);

        // Adjust if we're exceeding the total number of points
        if (totalPointsGenerated + pointsInThisCircle > numPoints) {
            pointsInThisCircle = numPoints - totalPointsGenerated;
        }

        // Calculate the radius for this circle
        const currentRadius = radius + circleNum * radiusIncrement;

        const angleStep = (2 * Math.PI) / pointsInThisCircle;

        // Calculate the angle offset
        let angleOffset = 0;
        if (circleNum > 0) {
            angleOffset = Math.PI / previousPointsInCircle;
        }

        for (let i = 0; i < pointsInThisCircle; i++) {
            const angle = i * angleStep + angleOffset;
            const stochasticRadius = currentRadius + (Math.random() - 0.5) * stochasticFactor;
            const x = centerX + stochasticRadius * Math.cos(angle) - itemWidth / 2;
            const y = centerY + stochasticRadius * Math.sin(angle) - itemHeight / 2;
            points.push({ x, y });
        }

        totalPointsGenerated += pointsInThisCircle;
        previousPointsInCircle = pointsInThisCircle;
        circleNum += 1; // Move to the next circle
    }

    return points;
}

export function generateGridPoints(editor, x, y, numRows, numCols, itemWidth, itemHeight, spacingX = 0, spacingY = 0) {
    const { x: startX, y: startY } = editor.screenToPage({x, y})
    
    const points = [];

    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            const x = startX + col * (itemWidth + spacingX);
            const y = startY + row * (itemHeight + spacingY);
            points.push({ x, y });
        }
    }

    return points;
}

// apply a progressive blur
export function applyProgressiveBlur(editor, centralShape, excludeIds = []){
    // get all shapes
    
    const shapes = editor.getCurrentPageShapes();
    // exclude those in excludeIds

    const threadIds = [...excludeIds, centralShape.id].map(id => {
        console.log("ID:", id)
        const threadBindings = editor.getBindingsToShape(id, 'thread')
        const updatedThreadBindings = threadBindings.filter(binding => {
            // check if the other end of the thread binding links to the name or an excerpt
            const thread = editor.getShape(binding.fromId)

            const otherBinding = editor.getBindingsFromShape(thread.id, 'thread').filter(binding => binding.toId !== id)[0]


            return ["name", "excerpt"].includes(editor.getShape(otherBinding.toId).type)
        })
        return updatedThreadBindings.map(threadBinding => threadBinding.fromId)
    }).flat();

    const shapesToBlur = shapes.filter(shape => !excludeIds.includes(shape.id) && !threadIds.includes(shape.id) && shape.id !== centralShape.id && shape.type !== 'name');


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
        editor.run(() => {
            editor.updateShape({
                id: shape.id,
                type: shape.type,
                opacity: 0.2
            })
        }, { ignoreShapeLock: true})
    }
}

export function removeProgressiveBlur(editor){
    // get all shapes
    const shapes = editor.getCurrentPageShapes();
    // exclude those in excludeIds
    for(let shape of shapes){
        if(['concept', 'thread', 'excerpt', 'name'].includes(shape.type) ){
            editor.run(() => {
                editor.updateShape({
                    id: shape.id,
                    type: shape.type,
                    opacity: 1
                })
            }, { ignoreShapeLock: true})
           
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