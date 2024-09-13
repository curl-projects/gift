import SceneRenderer from "../SceneRenderer";
import { useRef, useEffect, useState } from "react";
import { useStarFireSync } from '~/components/synchronization/StarFireSync';
import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders';

import { addGUICamera, addMovableCamera, addArcCamera, addTargetCamera } from "../helpers/cameras";
import { addCampfireParticles } from "../helpers/campfire";
import { addCampfireLight } from "../helpers/lights";
import { addLensEffects, addMotionBlur, fadeInScene } from "../helpers/post-processing";
import { enableFloatingPhysics } from "../helpers/physics";
import { addCenteredPhysicsText } from "../helpers/text"; // Import the new function
import { RenderingGroups } from "../helpers/constants"; // Import the RenderingGroups
import { addConstellationCanvas } from "../helpers/constellations";
import { createCanvasControlsButton, 
        createFocusButton, createFullscreenUI, createResetButton, createCampfireFocusButton } from "../helpers/gui";
import { addSkybox } from "../helpers/skybox";
import { addFog, addFireflyParticles } from "../helpers/forest-effects";
import { createFadeBehaviour } from "../helpers/mesh-behaviours";
import { createCharacter } from "../helpers/characters";
import { CampfireSyncListener } from "~/components/synchronization/CampfireSyncListener";
import { initializeLookingAtSky } from "../event-controllers/campfire-transition";

export function PitchScene(){
    const canvasZoneRef = useRef();
    const [reactScene, setReactScene] = useState(null); // Add state to hold the scene
    const { triggerEffect, activeEffect, setTriggerWarp, campfireView, setCampfireView, setSceneLoaded } = useStarFireSync();

    useEffect(() => {
        console.log("ACTIVE EFFECT", reactScene)
    }, [reactScene])

    function onRender(scene) { }

    async function onSceneReady(scene) {
       
        const camera = addMovableCamera(scene, "babylon-camera");
        // const light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(1, 1, 0), scene);

        const assetManager = new BABYLON.AssetsManager(scene);

        assetManager.onTaskErrorObservable.add(function (task) {
            console.error("Asset Manager Task Failed:", task.errorObject.message, task.errorObject.exception);
          });
        
        assetManager.onTaskSuccessObservable.add(function (task) {
            console.log("Task Completed Succesfully", task);
          });

        assetManager.useDefaultLoadingScreen = true;
    
        // addSkybox(scene, assetManager);


        scene.onReadyObservable.addOnce(async () => {
            addConstellationCanvas(scene, canvasZoneRef, RenderingGroups);
            setSceneLoaded(true)
            // initializeLookingAtSky(scene, camera);    

            });


        // Add mesh task
        const meshTask = assetManager.addMeshTask("meshTask", "", "/assets/", "redwoods-landscape.glb");
        meshTask.onSuccess = function (task) {
            // fade in/out behaviour

            task.loadedMeshes.forEach(mesh => {
                mesh.renderingGroupId = RenderingGroups.environment;

                if (mesh.name === 'campfire') {
                    const { fireSPS, fireBaseSPS, embersSPS, smokeSPS } = addCampfireParticles(scene, mesh);
                    const shadowGenerator = addCampfireLight(scene, mesh);

                    let boxHeight = 10;
                    addFireflyParticles(scene, 0.1, new BABYLON.Vector3(5, boxHeight / 2, -10), new BABYLON.Vector3(40, boxHeight, 40), 100);
                }
                else if(mesh.name.includes('redwood')){
                    mesh.enableBackFaceCulling = true;
                    // mesh.visibility = 0.1;
                }
            });
        };

        const skyboxTask = assetManager.addCubeTextureTask("skyboxTask", "/assets/night-sky.env");
        skyboxTask.onSuccess = function (task) {
            console.log("TASK TEXTURE:", task.texture)
            scene.environmentTexture = task.texture;
            scene.environmentIntensity = 0.1;
            const skybox = scene.createDefaultSkybox(task.texture, true);
            skybox.renderingGroupId = RenderingGroups.skybox;
        };



        assetManager.onFinish = function (tasks) {
            void Promise.all([
                import("@babylonjs/core/Debug/debugLayer"),
                import("@babylonjs/inspector"),
            ]).then((_values) => {
                console.log(_values);
                scene.debugLayer.show({
                    handleResize: true,
                    overlay: true,
                    // globalRoot: document.getElementById("#root") || undefined,
                });
            });
            scene.setRenderingAutoClearDepthStencil(RenderingGroups.skybox, false, false, false);
            scene.setRenderingAutoClearDepthStencil(RenderingGroups.environment, false, false, false);
            scene.setRenderingAutoClearDepthStencil(RenderingGroups.text, false, false, false);
        

            const lensEffects = addLensEffects(scene, camera, {
                // chromatic aberration
                // chromatic_aberration: 1,

                // visual distortion
                edge_blur: 0,
                distortion: 0,
                grain_amount: 0,

                // dof
                // dof_focus_distance: 10,
                // dof_darken: 0,
                // dof_pentagon: false,
                // dof_gain: 0.1,
                // dof_threshold: 0.1,
                // blur_noise: false,
            })
            const motionBlur = addMotionBlur(scene, camera)

            enableFloatingPhysics(scene);
            addFog(scene);



            // TODO: use these to trigger motion blur on certain animations
            camera.detachPostProcess(motionBlur)
            camera.attachPostProcess(motionBlur)


            createCharacter(scene)

            const textCamera = addGUICamera(scene, "text-camera", camera, 0x10000000);
            scene.activeCameras = [camera, textCamera];

    
            const advancedTexture = createFullscreenUI();
            createFocusButton(scene, camera, advancedTexture, triggerEffect, setTriggerWarp);
            createCanvasControlsButton(scene, advancedTexture);
            createResetButton(scene, advancedTexture);
            createCampfireFocusButton(scene, camera, advancedTexture, triggerEffect, setTriggerWarp, onRender);
            setReactScene(scene)

        };


        // fadeInScene(scene, camera);

        assetManager.load();
    }



    return(
        <>
            <SceneRenderer 
                antialias
                onSceneReady={onSceneReady}
                onRender={onRender}
                canvasZoneRef={canvasZoneRef}
                setReactScene={setReactScene}
            />
            {reactScene && (
                <CampfireSyncListener 
                    scene={reactScene}
                    onRender={onRender}
                />
            )}
        </>
    )
}