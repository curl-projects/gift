import "@babylonjs/core/Maths/math"

import { useRef } from "react";
import SceneRenderer from "../SceneRenderer";
import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders';
import { addConstellationCanvas } from "../helpers/constellations";
// import redwoodsModel from '~/components/environment/assets/simple-landscape.glb';
import { addMovableCamera } from "../helpers/cameras";
// import { Inspector } from '@babylonjs/inspector';
import ReactDOMServer from "react-dom/server";
import { createCanvasControlsButton, createFocusButton, createFullscreenUI } from "../helpers/gui";
import { addSkybox } from "../helpers/skybox";

const RenderingGroups = {
    embeddedElements: 0,
    skybox: 1,
    environment: 2,
}

export function CampfireScene() {
    const canvasZoneRef = useRef();

    async function onSceneReady(scene) {
        
        // scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);

        const camera = addMovableCamera(scene, 'babylon-camera');
        const light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(1, 1, 0), scene);
    
        BABYLON.SceneLoader.ImportMesh("", "/assets/", "simple-landscape.glb", scene, function (meshes) {
            meshes.forEach(mesh => {
                mesh.renderingGroupId = RenderingGroups.environment
            })
        })

        // var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 2, segments: 32}, scene);
        // sphere.renderingGroupId = RenderingGroups.environment
        // sphere.position.x = 3;

        // var box = BABYLON.MeshBuilder.CreateBox("box", {size: 1}, scene);    
        // box.renderingGroupId = RenderingGroups.environment
        // box.position.x = -3;
        // const sphere = BABYLON.MeshBuilder.CreateSphere('sphere', { diameter: 1 }, scene);
        // sphere.renderingGroupId = RenderingGroups.environment

        // needed for embedded elements
        scene.setRenderingAutoClearDepthStencil(RenderingGroups.skybox, false, false, false);
        scene.setRenderingAutoClearDepthStencil(RenderingGroups.environment, false, false, false);

        scene.onReadyObservable.addOnce(async() => {
            addConstellationCanvas(scene, canvasZoneRef, RenderingGroups);
        });

        // addSkybox(scene);

        const advancedTexture = createFullscreenUI();
        createFocusButton(scene, camera, advancedTexture);
        createCanvasControlsButton(scene, advancedTexture);

        // void Promise.all([
        //     import("@babylonjs/core/Debug/debugLayer"),
        //     import("@babylonjs/inspector"),
        // ]).then((_values) => {
        //     console.log(_values);
        //     scene.debugLayer.show({
        //         handleResize: true,
        //         overlay: true,
        //         // globalRoot: document.getElementById("#root") || undefined,
        //     });
        // });

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