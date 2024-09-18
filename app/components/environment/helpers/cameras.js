import * as BABYLON from "@babylonjs/core";

export function addMovableCamera(scene, name) {
    // Create a Universal Camera
    const camera = new BABYLON.UniversalCamera(name, new BABYLON.Vector3(0, 5, 14), scene);

    // // Enable quaternion rotation
    camera.useQuaternion = true;
    // camera.rotationQuaternion = BABYLON.Quaternion.Identity();

    camera.setTarget(new BABYLON.Vector3(0, 5, -14));
    // camera.rotation.y += Math.PI;
    // camera.rotation.x += BABYLON.Tools.ToRadians(10)

    // nearly minimum value, required because we get very close to the constellation plane
    // camera.minZ = 0.001;
    
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

export function addArcCamera(scene, name){
    const camera = new BABYLON.ArcRotateCamera(name, 0, 0, 0, new BABYLON.Vector3(0, 5, 12), scene);
    const canvas = scene.getEngine().getRenderingCanvas();
    camera.attachControl(canvas, true);
    
    camera.setPosition(new BABYLON.Vector3(0, 5, 12));
    // Lock the target to the camera's position
    camera.setTarget(camera.position);

    // Adjust camera properties to mimic first-person behavior
    camera.lowerRadiusLimit = 0.1;
    camera.upperRadiusLimit = 0.1;
    camera.wheelPrecision = 1000; // Disable zooming with the mouse wheel

    // Optionally, adjust the camera's speed and inertia
    camera.speed = 0.5;
    camera.inertia = 0.9;

    scene.activeCamera = camera;
    return camera;
}

export function addTargetCamera(scene, name){
    const camera = new BABYLON.TargetCamera(name, new BABYLON.Vector3(0, 5, 12), scene);
    camera.setTarget(new BABYLON.Vector3(0, 0, 0));
    const canvas = scene.getEngine().getRenderingCanvas();
    camera.attachControl(canvas, true);
    return camera;
}

export function addGUICamera(scene, name, parentCamera, layerMask){
    const camera = new BABYLON.UniversalCamera(name, new BABYLON.Vector3(0, 0, 0), scene);
    camera.layerMask = layerMask;
    camera.parent = parentCamera;
    return camera;
}