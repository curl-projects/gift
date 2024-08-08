import SceneRenderer from "./SceneRenderer";
import * as BABYLON from '@babylonjs/core';

export default function SceneEnvironment() {
    async function onSceneReady(scene) {
        const camera = new BABYLON.ArcRotateCamera('camera1', Math.PI / 2, Math.PI / 2, 2, BABYLON.Vector3.Zero(), scene);
        
        const canvas = scene.getEngine().getRenderingCanvas();

        camera.attachControl(canvas, true);

        const light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(1, 1, 0), scene);

        const sphere = BABYLON.MeshBuilder.CreateSphere('sphere', { diameter: 1 }, scene);

    }

    function onRender(scene) { }

    return (
        <SceneRenderer
            antialias
            onSceneReady={onSceneReady}
            onRender={onRender}
        />

    )
}