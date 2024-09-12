import * as GUI from '@babylonjs/gui';
import * as BABYLON from '@babylonjs/core';
import { Matrix } from '@babylonjs/core';
import { framerate, Epsilon } from '~/components/environment/helpers/constants';
import { customFadeIn, customFadeOut } from '~/components/environment/helpers/mesh-behaviours';
import { createShapeId } from "tldraw";



function calculateNewFovWithoutPosition(camera, mesh){
    const boundingInfo = mesh.getBoundingInfo();
    const boundingBox = boundingInfo.boundingBox;

    // Calculate the dimensions of the canvas
    const canvasHeight = mesh.scaling.y

    // Calculate the required FOV to fit the canvas height
    const distanceToCanvas = camera.position.subtract(mesh.position).length();
    const newFov = 2 * Math.atan((canvasHeight / 2) / distanceToCanvas);

    return newFov;
}

function calculateNewTargetRotations(camera, target){
    var targetRotationX;
    var targetRotationY;
    var targetRotationZ = 0;


    camera.upVector.normalize();
    const initialFocalDistance = target.subtract(camera.position).length();

    if(camera.position.z === target.z){
        camera.position.z += Epsilon;
    }

    camera._referencePoint.normalize().scaleInPlace(initialFocalDistance);

    Matrix.LookAtLHToRef(camera.position, target, camera.upVector, camera._camMatrix);
    camera._camMatrix.invert();

    targetRotationX = Math.atan(camera._camMatrix.m[6] / camera._camMatrix.m[10]);

      
    const vDir = target.subtract(camera.position);

    targetRotationY = vDir.x >= 0.0
        ? -Math.atan(vDir.z / vDir.x) + Math.PI / 2.0
        : -Math.atan(vDir.z / vDir.x) - Math.PI / 2.0;
        

    if (isNaN(targetRotationX)) {
        console.log("X is NaN")
        targetRotationX = 0;
    }

    if (isNaN(targetRotationY)) {
        console.log("Y is NaN")
        targetRotationY = 0;
    }

    if (isNaN(targetRotationZ)) {
        console.log("Z is NaN")
        targetRotationZ = 0;
    }

     // if (camera.rotationQuaternion) {
            //     Quaternion.RotationYawPitchRollToRef(targetRotationY, targetRotationX, targetRotationZ, camera.rotationQuaternion);
            // }


    return { targetRotationX, targetRotationY, targetRotationZ };
}

export function focusWithoutMovingToConstellationCanvas(scene, camera, triggerEffect, setTriggerWarp) {
    return new Promise((resolve) => {
        const constellationCanvas = scene.getMeshByName('constellationCanvas');
        if (constellationCanvas) {
            const target = constellationCanvas.position;

            const { targetRotationX, targetRotationY, targetRotationZ } = calculateNewTargetRotations(camera, target);

            console.log("targetRotationX", targetRotationX);
            console.log("targetRotationY", targetRotationY);
            console.log("targetRotationZ", targetRotationZ);

            const newFov = calculateNewFovWithoutPosition(camera, constellationCanvas);

            const ease = new BABYLON.CubicEase();
            ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

            // Create animations for rotation
            const rotationXAnimation = new BABYLON.Animation("rotationXAnimation", "rotation.x", framerate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
            const rotationYAnimation = new BABYLON.Animation("rotationYAnimation", "rotation.y", framerate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
            const rotationZAnimation = new BABYLON.Animation("rotationZAnimation", "rotation.z", framerate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

            // Create animation for FOV
            const fovAnimation = new BABYLON.Animation("fovAnimation", "fov", framerate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

            const targetAnimationDuration = 2;
            const fovAnimationDuration = 3;

            // Set key frames for rotation
            const keyFramesX = [
                { frame: 0, value: camera.rotation.x },
                { frame: targetAnimationDuration * framerate, value: targetRotationX }
            ];
            const keyFramesY = [
                { frame: 0, value: camera.rotation.y },
                { frame: targetAnimationDuration * framerate, value: targetRotationY }
            ];
            const keyFramesZ = [
                { frame: 0, value: camera.rotation.z },
                { frame: targetAnimationDuration * framerate, value: targetRotationZ }
            ];

            // Set key frames for FOV
            const fovKeyFrames = [
                { frame: 0, value: camera.fov },
                { frame: fovAnimationDuration * framerate, value: newFov }
            ];

            rotationXAnimation.setKeys(keyFramesX);
            rotationYAnimation.setKeys(keyFramesY);
            rotationZAnimation.setKeys(keyFramesZ);
            fovAnimation.setKeys(fovKeyFrames);

            rotationXAnimation.setEasingFunction(ease);
            rotationYAnimation.setEasingFunction(ease);
            rotationZAnimation.setEasingFunction(ease);
            fovAnimation.setEasingFunction(ease);

            // Add rotation animations to camera
            camera.animations.push(rotationXAnimation);
            camera.animations.push(rotationYAnimation);
            camera.animations.push(rotationZAnimation);

            console.log("SCENE MESHES:", scene.meshes);

            const redwoodMeshes = scene.meshes.filter(mesh => mesh.name && mesh.name.includes('redwood'));

            console.log("REDWOOD MESHES:", redwoodMeshes);

            // Start the rotation animations
            scene.beginDirectAnimation(camera, [rotationXAnimation, rotationYAnimation, rotationZAnimation], 0, targetAnimationDuration * framerate, false, 1, () => {
                // wait for the star to trigger
                triggerEffect({domain: "canvas", selector: {type: "shape", id: createShapeId("andre-vacha")}, effect: "ripple", callback: () => {
                    // start moving the redwoods out and widening the field of view
                    redwoodMeshes.map(mesh => customFadeOut(mesh, scene, 1.5, false));

                    camera.animations.push(fovAnimation);

                    // Start the FOV animation after rotation animations complete
                    scene.beginDirectAnimation(camera, [fovAnimation], 0, fovAnimationDuration * framerate, false, 1, () => {
                        // resolve(); // Resolve the promise when all animations are complete
                    });
                }});
            });
        } else {
            console.error("Constellation Canvas not found")
            resolve(); // Resolve immediately if constellationCanvas is not found
        }
    });
}

export function unfocusFromConstellationCanvas(scene, camera, triggerEffect, targetMeshName = 'campfire', targetFov = 0.8) {
    return new Promise((resolve) => {
        const targetMesh = scene.meshes.find(mesh => mesh.name && mesh.name === targetMeshName);

        console.log("targetMesh", targetMesh);
        if (targetMesh) {
            const target = targetMesh.position;

            const { targetRotationX, targetRotationY, targetRotationZ } = calculateNewTargetRotations(camera, target);

            const newFov = targetFov;

            const ease = new BABYLON.CubicEase();
            ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

            // Create animations for rotation
            const rotationXAnimation = new BABYLON.Animation("rotationXAnimation", "rotation.x", framerate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
            const rotationYAnimation = new BABYLON.Animation("rotationYAnimation", "rotation.y", framerate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
            const rotationZAnimation = new BABYLON.Animation("rotationZAnimation", "rotation.z", framerate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

            // Create animation for FOV
            const fovAnimation = new BABYLON.Animation("fovAnimation", "fov", framerate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

            const targetAnimationDuration = 2;
            const fovAnimationDuration = 3;

            // Set key frames for rotation
            const keyFramesX = [
                { frame: 0, value: camera.rotation.x },
                { frame: targetAnimationDuration * framerate, value: targetRotationX }
            ];
            const keyFramesY = [
                { frame: 0, value: camera.rotation.y },
                { frame: targetAnimationDuration * framerate, value: targetRotationY }
            ];
            const keyFramesZ = [
                { frame: 0, value: camera.rotation.z },
                { frame: targetAnimationDuration * framerate, value: targetRotationZ }
            ];

            // Set key frames for FOV
            const fovKeyFrames = [
                { frame: 0, value: camera.fov },
                { frame: fovAnimationDuration * framerate, value: newFov }
            ];

            rotationXAnimation.setKeys(keyFramesX);
            rotationYAnimation.setKeys(keyFramesY);
            rotationZAnimation.setKeys(keyFramesZ);
            fovAnimation.setKeys(fovKeyFrames);

            rotationXAnimation.setEasingFunction(ease);
            rotationYAnimation.setEasingFunction(ease);
            rotationZAnimation.setEasingFunction(ease);
            fovAnimation.setEasingFunction(ease);

            // Add rotation animations to camera
            camera.animations.push(rotationXAnimation);
            camera.animations.push(rotationYAnimation);
            camera.animations.push(rotationZAnimation);

            console.log("SCENE MESHES:", scene.meshes);

            triggerEffect({domain: "canvas", selector: {type: "shape", id: createShapeId("andre-vacha")}, effect: "ripple", callback: () => {
                const redwoodMeshes = scene.meshes.filter(mesh => mesh.name && mesh.name.includes('redwood'));

                console.log("REDWOOD MESHES:", redwoodMeshes);
    
                redwoodMeshes.map(mesh => customFadeIn(mesh, scene, 1.5, false));
    
                scene.beginDirectAnimation(camera, [fovAnimation], 0, fovAnimationDuration * framerate, false, 1, () => {
                    scene.beginDirectAnimation(camera, [rotationXAnimation, rotationYAnimation, rotationZAnimation], 0, targetAnimationDuration * framerate, false, 1, () => {
                        
                        resolve();
                    });
                });
            }
            })
            resolve(); // Resolve immediately if targetMesh is not found
        }
        else{
            console.error(`${targetMeshName} not found`);
            resolve();
        }
    });
}



export function initializeLookingAtSky(scene, camera) {
    const constellationCanvas = scene.getMeshByName('constellationCanvas');
    if (constellationCanvas) {
        const target = constellationCanvas.position;

        const { targetRotationX, targetRotationY, targetRotationZ } = calculateNewTargetRotations(camera, target);

        console.log("targetRotationX", targetRotationX);
        console.log("targetRotationY", targetRotationY);
        console.log("targetRotationZ", targetRotationZ);

        const newFov = calculateNewFovWithoutPosition(camera, constellationCanvas);

        // Directly set the camera's rotation and FOV
        camera.rotation.x = targetRotationX;
        camera.rotation.y = targetRotationY;
        camera.rotation.z = targetRotationZ;
        camera.fov = newFov;

        console.log("Camera initialized to look at the sky without animation.");

        // Handle redwood meshes scaling
        const redwoodMeshes = scene.meshes.filter(mesh => mesh.name && mesh.name.includes('redwood'));
        console.log("REDWOOD MESHES:", redwoodMeshes);
        redwoodMeshes.forEach(mesh => customFadeOut(mesh, scene, 1.5, true)); // Directly apply the fade out effect
    } else {
        console.error("Constellation Canvas not found");
    }
}

export function giveControlToCanvas() {
    document.body.style.pointerEvents = 'none';
}


























// OLD FUNCS:

function calculateNewPositionAndFov(camera, mesh){
    const boundingInfo = mesh.getBoundingInfo();
    const boundingBox = boundingInfo.boundingBox;

    // Calculate the dimensions of the canvas
    const canvasWidth = mesh.scaling.x
    const canvasHeight = mesh.scaling.y

    // Calculate the required FOV to fit the canvas height
    const newFov = 2 * Math.atan((canvasHeight / 2) / camera.position.length());

    // Calculate the new camera position

    const canvasNormal = mesh.forward; // this should be 'up' if the component isn't vertical
    const distanceToCanvas = (canvasHeight / 2) / Math.tan(newFov / 2);
    const newPosition = mesh.position.subtract(canvasNormal.scale(distanceToCanvas));

    return { newPosition, newFov };
}


function focusAndMoveToConstellationCanvas(scene, camera){
    const constellationCanvas = scene.getMeshByName('constellationCanvas');
    if (constellationCanvas) {
        
        const target = constellationCanvas.position;

        const { targetRotationX, targetRotationY, targetRotationZ } = calculateNewTargetRotations(camera, target);

        console.log("targetRotationX", targetRotationX)
        console.log("targetRotationY", targetRotationY)
        console.log("targetRotationZ", targetRotationZ)
       
       
        const { newPosition, newFov } = calculateNewPositionAndFov(camera, constellationCanvas);

        const ease = new BABYLON.CubicEase();
        ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

        // Create animations for rotation
        const rotationXAnimation = new BABYLON.Animation("rotationXAnimation", "rotation.x", framerate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        const rotationYAnimation = new BABYLON.Animation("rotationYAnimation", "rotation.y", framerate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        const rotationZAnimation = new BABYLON.Animation("rotationZAnimation", "rotation.z", framerate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        
        // // Create animations for position and fov
        const positionAnimation = new BABYLON.Animation("positionAnimation", "position", framerate, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        const fovAnimation = new BABYLON.Animation("fovAnimation", "fov", framerate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

        // Set key frames for tation
        const keyFramesX = [
            { frame: 0, value: camera.rotation.x },
            { frame: 1 * framerate, value: targetRotationX }
        ];
        const keyFramesY = [
            { frame: 0, value: camera.rotation.y },
            { frame: 1 * framerate, value: targetRotationY }
        ];
        const keyFramesZ = [
            { frame: 0, value: camera.rotation.z },
            { frame: 1 * framerate, value: targetRotationZ }
        ];

         // Set key frames for position
         const positionKeyFrames = [
            { frame: 0, value: camera.position.clone() },
            { frame: 1 * framerate, value: newPosition }
        ];

        // Set key frames for FOV
        const fovKeyFrames = [
            { frame: 0, value: camera.fov },
            { frame: 1 * framerate, value: newFov }
        ];


        rotationXAnimation.setKeys(keyFramesX);
        rotationYAnimation.setKeys(keyFramesY);
        rotationZAnimation.setKeys(keyFramesZ);
        positionAnimation.setKeys(positionKeyFrames);
        fovAnimation.setKeys(fovKeyFrames);

        rotationXAnimation.setEasingFunction(ease);
        rotationYAnimation.setEasingFunction(ease);
        rotationZAnimation.setEasingFunction(ease);
        positionAnimation.setEasingFunction(ease);
        fovAnimation.setEasingFunction(ease);


        // Add animations to camera
        camera.animations.push(rotationXAnimation);
        camera.animations.push(rotationYAnimation);
        camera.animations.push(rotationZAnimation);
        camera.animations.push(positionAnimation);
        camera.animations.push(fovAnimation);


        // Start the animation
        scene.beginDirectAnimation(camera, [rotationXAnimation, rotationYAnimation, rotationZAnimation, positionAnimation, fovAnimation], 0, 1 * framerate, false);
    }
}

