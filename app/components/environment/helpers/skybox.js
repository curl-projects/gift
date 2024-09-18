import * as BABYLON from '@babylonjs/core';
import { RenderingGroups } from './constants';

export function addSkybox(scene, assetManager) {
    const skyboxTask = assetManager.addCubeTextureTask("skyboxTask", "/assets/night-sky.env");
    skyboxTask.onSuccess = function (task) {
        scene.environmentTexture = task.texture;
        scene.environmentIntensity = 0.1;
        const skybox = scene.createDefaultSkybox(task.texture, true);
        skybox.renderingGroupId = RenderingGroups.skybox;
        skybox.material.applyFog = false;
    };

};

export function altAddSkybox(scene) {
    const hdrStars = BABYLON.CubeTexture.CreateFromPrefilteredData("/assets/night-sky.env", scene);
    scene.environmentTexture = hdrStars;
    scene.environmentIntensity = 0.1; // Decrease intensity (1.0 is the default value)
    // scene.createDefaultSkybox(hdrStars, true);
    const skybox = scene.createDefaultSkybox(hdrStars, true);
    skybox.renderingGroupId = RenderingGroups.skybox;
    // skybox.material.emissiveColor = new BABYLON.Color3(9 /255, 40 /255, 55 /255); // Red color
}

export function addBoxSkybox(scene) {
    const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, scene);
    const skyboxMaterial = new BABYLON.StandardMaterial("skyBoxMaterial", scene);
    skyboxMaterial.emissiveColor = new BABYLON.Color3(9 /255, 40 /255, 55 /255); // Set your desired color here
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;
    skybox.infiniteDistance = true;


    skybox.renderingGroupId = RenderingGroups.skybox;

    return skybox;
    
}