import { useRef } from "react";
import SceneRenderer from "./SceneRenderer";
import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders';
import { addConstellationCanvas } from "./helpers/constellation-canvas";
// import redwoodsModel from '~/components/environment/assets/simple-landscape.glb';
import { addMovableCamera } from "./helpers/cameras";
// import { Inspector } from '@babylonjs/inspector';

export default function SceneEnvironment() {
    const canvasZoneRef = useRef();

    async function onSceneReady(scene) {
        const camera = addMovableCamera(scene);

        const meshes = await BABYLON.SceneLoader.ImportMeshAsync(null, "/assets/", "simple-landscape.glb", scene)

        const light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(1, 1, 0), scene);

        const sphere = BABYLON.MeshBuilder.CreateSphere('sphere', { diameter: 1 }, scene);
        
        scene.onReadyObservable.addOnce(async () => {
            await addConstellationCanvas(scene, canvasZoneRef);
        });

        const { Inspector } = await import('@babylonjs/inspector');
        Inspector.Show(scene, {
            overlay: true
        });
    }

    function onRender(scene) { }

    return (
        <SceneRenderer
            antialias
            onSceneReady={onSceneReady}
            onRender={onRender}
            canvasZoneRef={canvasZoneRef}
        />

    )
}