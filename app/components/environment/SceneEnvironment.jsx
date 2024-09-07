import "@babylonjs/core/Maths/math"

import { useRef } from "react";
import SceneRenderer from "./SceneRenderer";
import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders';
import { addConstellationCanvas } from "./helpers/constellation-canvas";
// import redwoodsModel from '~/components/environment/assets/simple-landscape.glb';
import { addMovableCamera } from "./helpers/cameras";
// import { Inspector } from '@babylonjs/inspector';
import { HtmlMeshRenderer } from "babylon-htmlmesh";
import { HtmlMesh } from "babylon-htmlmesh";

export default function SceneEnvironment() {
    const canvasZoneRef = useRef();

    async function onSceneReady(scene) {
        const camera = addMovableCamera(scene);
        const light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(1, 1, 0), scene);

        BABYLON.SceneLoader.ImportMesh("", "/assets/", "simple-landscape.glb", scene, function (meshes) {

        })
    

        const sphere = BABYLON.MeshBuilder.CreateSphere('sphere', { diameter: 1 }, scene);

        scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);

        const htmlMeshRenderer = new HtmlMeshRenderer(scene);
        const htmlMeshDiv = new HtmlMesh(scene, "html-mesh-div");
        const div = document.createElement("div");
            div.innerHTML = `
                <form style="padding: 10px; transform: scale(4); transform-origin: 0 0;">
                    <label for="name">Name:</label>
                    <input type="text" id="name" name="name" required><br><br>
                    
                    <label for="country">Country:</label>
                    <select id="country" name="country">
                        <option value="USA">USA</option>
                        <option value="Canada">Canada</option>
                        <option value="UK">UK</option>
                        <option value="Australia">Australia</option>
                    </select><br><br>
                    
                    <label for="hobbies">Hobbies:</label><br>
                    <input type="checkbox" id="hobby1" name="hobbies" value="Reading">
                    <label for="hobby1">Reading</label><br>
                    <input type="checkbox" id="hobby2" name="hobbies" value="Gaming">
                    <label for="hobby2">Gaming</label><br>
                    <input type="checkbox" id="hobby3" name="hobbies" value="Sports">
                    <label for="hobby3">Sports</label><br><br>
                </form>
            `;
        div.style.backgroundColor = "white";
        div.style.width = "480px";
        div.style.height = "360px";
        // Style the form
      
        htmlMeshDiv.setContent(div, 4, 3);
        htmlMeshDiv.position.x = -3;
        htmlMeshDiv.position.y = 2;
        

        // scene.onReadyObservable.addOnce(() => {
        //     addConstellationCanvas(scene, canvasZoneRef);
        // });

        // addConstellationCanvas(scene, canvasZoneRef);

        

        // const { Inspector } = await import('@babylonjs/inspector');

        // Inspector.Show(scene, {
        //     overlay: true
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