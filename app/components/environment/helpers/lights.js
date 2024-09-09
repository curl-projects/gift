import * as BABYLON from '@babylonjs/core';

export function addCampfireLight(scene, mesh) {
    const campfireLight = new BABYLON.PointLight("campfireLight", new BABYLON.Vector3(0, 1, 0), scene);
    campfireLight.intensity = 500;  // Adjust the intensity as needed
    campfireLight.range = 50;       // Adjust the range as needed
    const orangeColor = new BABYLON.Color3(1.0, 0.5, 0.1); // Adjusted RGB values for a more orange light
    campfireLight.diffuse = orangeColor;
    campfireLight.specular = orangeColor;

    campfireLight.parent = mesh
    campfireLight.position = new BABYLON.Vector3(-0.3, 1, 0.2) // relative position from parent

    const shadowGenerator = new BABYLON.ShadowGenerator(2048, campfireLight);
    shadowGenerator.usePoissonSampling = true; // Optionally, use Poisson Sampling for softer shadows

    return shadowGenerator
}


