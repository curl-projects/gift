import SceneRenderer from "../SceneRenderer";
import { useRef } from "react";
import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders';


import { addGUICamera, addMovableCamera } from "../helpers/cameras";
import { addCampfireParticles } from "../helpers/campfire";
import { addCampfireLight } from "../helpers/lights";
import { fadeInScene } from "../helpers/post-processing";
import { enableFloatingPhysics } from "../helpers/physics";
import { addCenteredPhysicsText } from "../helpers/text"; // Import the new function
import { RenderingGroups } from "../helpers/constants"; // Import the RenderingGroups

export function PitchScene(){
    const canvasZoneRef = useRef();

    async function onSceneReady(scene) {
       
        const camera = addMovableCamera(scene, "babylon-camera");
        const light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(1, 1, 0), scene);

    
        enableFloatingPhysics(scene);

        BABYLON.SceneLoader.ImportMesh("", "/assets/", "simple-landscape.glb", scene, function (meshes) {
            meshes.forEach(mesh => {
                mesh.renderingGroupId = RenderingGroups.environment

                if(mesh.name === 'campfire'){
                    const { fireSPS, fireBaseSPS, embersSPS, smokeSPS } = addCampfireParticles(scene, mesh);
                    const shadowGenerator = addCampfireLight(scene, mesh);
                }
            })
        })

        scene.setRenderingAutoClearDepthStencil(RenderingGroups.skybox, false, false, false);
        scene.setRenderingAutoClearDepthStencil(RenderingGroups.environment, false, false, false);
        scene.setRenderingAutoClearDepthStencil(RenderingGroups.text, false, false, false);

        fadeInScene(scene, camera);


        const textCamera = addGUICamera(scene, "text-camera", camera, 0x10000000);

        // doesn't work if you set it in the addGUICamera function
        scene.activeCameras = [camera, textCamera]

        // Add floating text in the center of the screen
        addCenteredPhysicsText(scene, "Hello, World!", textCamera, 0x10000000);
    }

    function onRender(scene) { }

    return(
        <SceneRenderer 
            antialias
            onSceneReady={onSceneReady}
            onRender={onRender}
            canvasZoneRef={canvasZoneRef}
        />
    )
}