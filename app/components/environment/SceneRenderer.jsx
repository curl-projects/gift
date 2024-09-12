import { useEffect, useRef } from "react";
import { Engine, Scene, RenderTargetTexture, Layer, Effect, PostProcess } from '@babylonjs/core';

export default function SceneRenderer({
    antialias,
    engineOptions,
    adaptToDeviceRatio,
    sceneOptions,
    onRender,
    onSceneReady,
    canvasZoneRef,
    setReactScene,
    ...rest
  }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        console.log("TRIGGERING!")
        const { current: canvas } = canvasRef;

        if (!canvas) return;

        const engine = new Engine(canvas, antialias, {
            preserveDrawingBuffer: true,
            alpha: true,
            ...engineOptions
        }, adaptToDeviceRatio);
        const scene = new Scene(engine, sceneOptions);

        if (scene.isReady()) {
            onSceneReady(scene);
        } else {
            scene.onReadyObservable.addOnce(() => onSceneReady(scene));
        }
        engine.runRenderLoop(() => {
            if (typeof onRender === 'function') onRender(scene);
            scene.render();
        });

        const resize = () => {
            scene.getEngine().resize();
        };

        if (window) {
            window.addEventListener('resize', resize);
        }

        return () => {
            scene.getEngine().dispose();

            if (window) {
                window.removeEventListener('resize', resize);
            }
        };
    }, []); // if you add dependencies here it reloads when context changes

    return (
        <div id='canvasZone' ref={canvasZoneRef} style={{
            height: "100vh",
            width: "100vw",
        }}>
            <canvas
                ref={canvasRef}
                {...rest}
                style={{
                    height: '100%',
                    width: '100%',
                }}
            />
        </div>

    )
}