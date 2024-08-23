export function animateShapeProperties(editor, shapeId, properties, duration, easing = t => t) {
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

            // Apply easing function
            const easedT = easing(t);

            // Interpolate properties
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