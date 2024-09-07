import * as BABYLON from '@babylonjs/core';

export function addSkybox(scene) {
    const hdrStars = BABYLON.CubeTexture.CreateFromPrefilteredData("/assets/night-sky.env", scene);
    scene.environmentTexture = hdrStars;
    scene.environmentIntensity = 0.1; // Decrease intensity (1.0 is the default value)
    scene.createDefaultSkybox(hdrStars, true);
}