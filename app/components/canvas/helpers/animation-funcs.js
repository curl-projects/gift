export function animateShapeProperties(editor, shapeId, properties, duration, easingFunction = (t) => t) {
    const shape = editor.getShape(shapeId);
    if (!shape) return Promise.reject(new Error('Shape not found'));

    const startValues = {};
    const endValues = properties;
    const startTime = performance.now();

    // Capture the initial values of the properties to be animated
    for (const prop in properties) {
        startValues[prop] = shape[prop];
    }

    return new Promise((resolve) => {
        function animate() {
            const currentTime = performance.now();
            const elapsedTime = currentTime - startTime;
            const t = Math.min(elapsedTime / duration, 1); // Normalize time to [0, 1]
            const easedT = easingFunction(t); // Use the easing function

            // Interpolate properties using the eased time
            const newValues = {};
            for (const prop in properties) {
                newValues[prop] = startValues[prop] + (endValues[prop] - startValues[prop]) * easedT;
            }

            // Update shape properties
            editor.updateShape({
                id: shapeId,
                type: shape.type,
                ...newValues
            });

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                resolve();
            }
        }

        requestAnimationFrame(animate);
    });
}