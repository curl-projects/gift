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

}