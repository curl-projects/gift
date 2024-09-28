import { useEffect } from "react";
import { useEditor, AssetRecordType, defaultEditorAssetUrls, createShapeId } from "tldraw";
import { useStarFireSync } from "~/components/synchronization/StarFireSync";

export function ImagePainter() {
    const editor = useEditor();
    const { portfolioControls } = useStarFireSync();

    useEffect(() => {
        if (editor) {
            if (portfolioControls.visible) {
                portfolioControls.onComplete && portfolioControls.onComplete();
                const oldImages = editor.getCurrentPageShapes().filter(shape => shape.type === 'image');
                editor.deleteShapes(oldImages);

                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;

                const scaling = 3;
                const images = [
                    { src: "/images/portfolio1.png", id: "portfolio1", h: 900 / scaling, w: 1400 / scaling, x: viewportWidth * 0.45, y: viewportHeight * 0.3 },
                    { src: "/images/portfolio2.png", id: "portfolio2", h: 811 / scaling, w: 1000 / scaling, x: viewportWidth * 0.2, y: viewportHeight * 0.4 },
                    { src: "/images/portfolio3.png", id: "portfolio3", h: 550 / scaling, w: 900 / scaling, x: viewportWidth * 0.15, y: viewportHeight * 0.2 },
                ];

                for (const image of images) {
                    const asset = {
                        id: AssetRecordType.createId(image.id),
                        type: 'image',
                        typeName: 'asset',
                        props: {
                            name: image.id,
                            src: image.src,
                            w: image.w,
                            h: image.h,
                            mimeType: 'image/png',
                            isAnimated: false,
                        },
                        meta: {}
                    };

                    editor.createAssets([asset]);

                    editor.createShape({
                        type: 'image',
                        id: createShapeId(image.id),
                        x: editor.screenToPage({ x: image.x, y: image.y }).x,
                        y: editor.screenToPage({ x: image.x, y: image.y }).y,
                        opacity: 0, // Start with opacity 0
                        props: {
                            assetId: asset.id,
                            w: image.w,
                            h: image.h,
                            
                        }
                    });

                    let opacity = 0;

                    const animate = () => {
                        opacity += 0.01;
                        if (opacity <= 1) {
                            editor.updateShape({id: createShapeId(image.id), opacity: opacity});
                            requestAnimationFrame(animate);
                        }
                    };
                    requestAnimationFrame(animate);
                }
            } else {
                const oldImages = editor.getCurrentPageShapes().filter(shape => shape.type === 'image');
                editor.deleteShapes(oldImages);
                portfolioControls.onComplete && portfolioControls.onComplete();
            }
        }
    }, [editor, portfolioControls.visible]);

    return null;
}