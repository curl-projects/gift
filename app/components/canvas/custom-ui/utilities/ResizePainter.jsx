import { useEffect } from 'react';
import { createShapeId, useEditor } from 'tldraw';
import { useParams } from "@remix-run/react";

export function ResizePainter() {
    const editor = useEditor();
    const { person } = useParams();

    useEffect(() => {
        let resizeTimeout;

        const handleResize = () => {
            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }

            resizeTimeout = setTimeout(() => {
                if (editor) {
                    // Example: Center the view based on new window size
                    const nameShape = editor.getShape({ id: createShapeId(person)})
                    if(nameShape){
                        editor.zoomToBounds(editor.getShapePageBounds(nameShape), {
                            animation: {
                                duration: 500,
                                easing: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
                            },
                            targetZoom: 1
                        })
                    }
                }
            }, 100); // Adjust the debounce delay as needed
        };

        // Initial adjustment
        handleResize();

        window.addEventListener('resize', handleResize);

        // Clean up the event listener on unmount
        return () => {
            window.removeEventListener('resize', handleResize);
            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }
        };
    }, [editor]);

    return null;
}