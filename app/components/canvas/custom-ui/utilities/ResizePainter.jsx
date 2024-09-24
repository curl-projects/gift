import { useEffect } from 'react';
import { createShapeId, useEditor } from 'tldraw';

export function ResizePainter() {
    const editor = useEditor();

    useEffect(() => {
        const handleResize = () => {
            if (editor) {
                // Example: Center the view based on new window size
                const nameShape = editor.getShape({ id: createShapeId('andre-vacha')})
                if(nameShape){
                    editor.zoomToBounds(editor.getShapePageBounds(nameShape), {
                        animation: {
                            duration: 200,
                            easing: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
                        },
                        targetZoom: 1
                    })
                }
                
            }
        };

        // Initial adjustment
        handleResize();

        window.addEventListener('resize', handleResize);

        // Clean up the event listener on unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [editor]);

    return null;
}