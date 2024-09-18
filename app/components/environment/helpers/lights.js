import * as BABYLON from '@babylonjs/core';

export function addCampfireLight(scene, mesh) {
    const campfireLight = new BABYLON.PointLight("campfireLight", new BABYLON.Vector3(0, 1, 0), scene);
    campfireLight.intensity = 5000;  // Adjust the intensity as needed
    campfireLight.range = 600;       // Adjust the range as needed
    const diffuse = new BABYLON.Color3(118 / 255, 50 / 255, 7 / 255); // Adjusted RGB values for a more orange light
    const specular = new BABYLON.Color3(215 / 255, 78 / 255, 0 / 255); // Adjusted RGB values for a more orange light
    campfireLight.diffuse = diffuse;
    campfireLight.specular = specular;

    campfireLight.parent = mesh
    campfireLight.position = new BABYLON.Vector3(-0.3, 1, 0.2) // relative position from parent

    const shadowGenerator = new BABYLON.ShadowGenerator(2048, campfireLight);
    shadowGenerator.usePoissonSampling = true; // Optionally, use Poisson Sampling for softer shadows

    return shadowGenerator
}


export function addMoonLight(scene) {
    const moonLight = new BABYLON.PointLight("moonLight", new BABYLON.Vector3(0, 30, 0), scene);
    moonLight.intensity = 1000;  // Adjust the intensity as needed
    moonLight.range = 1000;       // Adjust the range as needed
    const diffuse = new BABYLON.Color3(173 / 255, 216 / 255, 230 / 255); // Adjusted RGB values for a silvery blue light
    moonLight.diffuse = diffuse;
    return moonLight
}