import * as BABYLON from "@babylonjs/core";

export function addMovableCamera(scene) {
    // Create a Universal Camera
    const camera = new BABYLON.UniversalCamera("babylon-camera", new BABYLON.Vector3(0, 5, 12), scene);
    camera.rotation.y += Math.PI;
    camera.rotation.x += BABYLON.Tools.ToRadians(10)

    // nearly minimum value, required because we get very close to the constellation plane
    camera.minZ = 0.001;
    
    // Attach the camera to the canvas
    const canvas = scene.getEngine().getRenderingCanvas();
    camera.attachControl(canvas, true);
    scene.activeCamera = camera;
    // // Set camera properties
    // camera.speed = 0.5; // Adjust the speed of the camera
    // camera.inertia = 0.9; // Adjust the inertia (higher values = more smoothness)

    // // Enable collision detection
    // camera.checkCollisions = true;
    // camera.applyGravity = true;

    // // Enable keys to move the camera
    // camera.keysUp.push(87);    // W
    // camera.keysDown.push(83);  // S
    // camera.keysLeft.push(65);  // A
    // camera.keysRight.push(68); // D

    // camera.upperBetaLimit = (Math.PI / 2) * 0.99;

    // Set the ellipsoid to prevent the camera from going through objects
    // camera.ellipsoid = new BABYLON.Vector3(1, 1, 1);
    
    return camera;
}
