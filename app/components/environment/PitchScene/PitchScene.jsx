import SceneRenderer from "../SceneRenderer";
import { useRef, useEffect, useState } from "react";
import { useStarFireSync } from '~/components/synchronization/StarFireSync';
import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders';

import { addGUICamera, addMovableCamera, addArcCamera, addTargetCamera } from "../helpers/cameras";
import { addCampfireParticles } from "../helpers/campfire";
import { addCampfireLight, addMoonLight } from "../helpers/lights";
import { addLensEffects, addMotionBlur, fadeInScene } from "../helpers/post-processing";
import { enableFloatingPhysics } from "../helpers/physics";
import { addPhysicsText } from "../helpers/text"; // Import the new function
import { RenderingGroups } from "../helpers/constants"; // Import the RenderingGroups
import { addConstellationCanvas } from "../helpers/constellations";
import { createCanvasControlsButton, 
        createFocusButton, createFullscreenUI, createResetButton, createCampfireFocusButton } from "../helpers/gui";
import { addSkybox, altAddSkybox, addBoxSkybox } from "../helpers/skybox";
import { addFog, addFireflyParticles, addExponentialFog } from "../helpers/forest-effects";
import { createFadeBehaviour } from "../helpers/mesh-behaviours";
import { addNarrator, addPlayer } from "../helpers/characters";
import { CampfireSyncListener } from "~/components/synchronization/CampfireSyncListener";
import { initializeLookingAtSky } from "../event-controllers/campfire-transition";
import { addCommandEventListener } from "../helpers/event-handlers";
import { addSmokeShader } from "../helpers/shaders";

export function PitchScene(){
    const canvasZoneRef = useRef();
    const [reactScene, setReactScene] = useState(null); // Add state to hold the scene
    const { triggerEffect, activeEffect, setTriggerWarp, 
            campfireView, setCampfireView, setSceneLoaded,
            commandEvent,
        } = useStarFireSync();

    useEffect(() => {
        console.log("ACTIVE EFFECT", reactScene)
        if(reactScene && commandEvent){
            addCommandEventListener(reactScene, commandEvent)
        }
        // add event handler to check if the narrator is looking at the sky
    }, [reactScene, commandEvent])

    function onRender(scene) { }

    async function onSceneReady(scene) {
       
        const camera = addMovableCamera(scene, "babylon-camera");
        // addMoonLight(scene);
        // const light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(1, 1, 0), scene);

        const assetManager = new BABYLON.AssetsManager(scene);

        assetManager.onTaskErrorObservable.add(function (task) {
            console.error("Asset Manager Task Failed:", task.errorObject.message, task.errorObject.exception);
          });
        
        assetManager.onTaskSuccessObservable.add(function (task) {
            console.log("Task Completed Succesfully", task);
          });

          
        assetManager.useDefaultLoadingScreen = true;

        scene.onReadyObservable.addOnce(async () => {
            console.warn('scene ready')
            addConstellationCanvas(scene, canvasZoneRef, RenderingGroups);
            setSceneLoaded(true)
    
            });

        // Add mesh task
        // const smokeShader = await addSmokeShader(scene);
        // const customShader = addCustomShader(scene);
        
        // const nodeMaterial = await BABYLON.NodeMaterial.ParseFromSnippetAsync("81NNDY#126", scene)

        const meshTask = assetManager.addMeshTask("meshTask", "", "/assets/", "simple-landscape-improved.glb");
        meshTask.onSuccess = function (task) {
            // fade in/out behaviour

            const campfire = task.loadedMeshes.find(mesh => mesh.name === 'campfire');
            const { fireSPS, fireBaseSPS, embersSPS, smokeSPS } = addCampfireParticles(scene, campfire);
            const shadowGenerator = addCampfireLight(scene, campfire);
        
            task.loadedMeshes.forEach(mesh => {
                mesh.renderingGroupId = RenderingGroups.environment;
                mesh.receiveShadows = true;
                console.log("MESH:", mesh.name)

                if (mesh.name === 'campfire') {
                    let boxHeight = 10;
                    addFireflyParticles(scene, 0.01, new BABYLON.Vector3(5, boxHeight / 2, -10), new BABYLON.Vector3(40, boxHeight, 40), 100);
                }
                else if(mesh.name.includes('redwood')){
                    mesh.enableBackFaceCulling = true;
                    // customShader.setTexture("tex0", mesh.material.diffuseTexture);
                    // mesh.receiveShadows = true;
                    // shadowGenerator.addShadowCaster(mesh);
                }
            });

            addNarrator(scene, shadowGenerator)
            addPlayer(scene, shadowGenerator)

       
        };


        addBoxSkybox(scene);

        assetManager.onFinish = function (tasks) {
            void Promise.all([
                import("@babylonjs/core/Debug/debugLayer"),
                import("@babylonjs/inspector"),
            ]).then((_values) => {
                console.log(_values);
                scene.debugLayer.show({
                    handleResize: true,
                    overlay: false,
                    // globalRoot: document.getElementById("#root") || undefined,
                });
            }); 

            
          

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
            // const motionBlur = addMotionBlur(scene, camera)

            // TODO: use these to trigger motion blur on certain animations
            // camera.detachPostProcess(motionBlur)
            // camera.attachPostProcess(motionBlur)

            // enableFloatingPhysics(scene);
            // addFog(scene, new BABYLON.Color3(9 /255, 40 /255, 55 /255));
            addExponentialFog(scene, new BABYLON.Color4(0, 0, 0, 0.5));
            // addExponentialFog(scene, new BABYLON.Color3(9 /255, 40 /255, 55 /255));
    

            // addNarrator(scene)
            // addPlayer(scene)

            // const char = scene.meshes.find(mesh => mesh.name === "WhiteClown")
            // char.material = smokeShader;
            // characterMesh.getChildMeshes().forEach((subMesh) => {
            //     console.log("Applying smoke shader to sub-mesh:", subMesh.name);
            //     subMesh.material = smokeShader;
            // });



            // const textCamera = addGUICamera(scene, "text-camera", camera, 0x10000000);
            // scene.activeCameras = [camera, textCamera];


    
            // const advancedTexture = createFullscreenUI();
            // createFocusButton(scene, camera, advancedTexture, triggerEffect, setTriggerWarp);
            // createCanvasControlsButton(scene, advancedTexture);
            // createResetButton(scene, advancedTexture);
            // createCampfireFocusButton(scene, camera, advancedTexture, triggerEffect, setTriggerWarp, onRender);
            console.warn('asset manager finished')
            setReactScene(scene)

            scene.setRenderingAutoClearDepthStencil(RenderingGroups.environment, false, false, false);
            scene.setRenderingAutoClearDepthStencil(RenderingGroups.text, false, false, false);
            scene.setRenderingAutoClearDepthStencil(RenderingGroups.skybox, false, false, false);
        

    

        };


        // fadeInScene(scene, camera);

        assetManager.load();
    }



    return(
        <>
            <SceneRenderer 
                antialias={true}
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