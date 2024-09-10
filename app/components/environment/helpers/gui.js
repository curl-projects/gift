import * as GUI from '@babylonjs/gui';
import * as BABYLON from '@babylonjs/core';
import { Matrix } from '@babylonjs/core';
import { framerate, Epsilon } from './constants';
import { customFadeIn, customFadeOut } from './mesh-behaviours';
import { createShapeId } from "tldraw";

export function createFullscreenUI() {
    return GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
}

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

function focusWithoutMovingToConstellationCanvas(scene, camera, triggerEffect) {
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

        console.log("SCENE MESHES:", scene.meshes)
        
        const redwoodMeshes = scene.meshes.filter(mesh => mesh.name && mesh.name.includes('redwood'));

        console.log("REDWOOD MESHES:", redwoodMeshes)
        // Start the rotation animations

        scene.beginDirectAnimation(camera, [rotationXAnimation, rotationYAnimation, rotationZAnimation], 0, targetAnimationDuration * framerate, false, 1, () => {
            // wait for the star to trigger
            triggerEffect({domain: "canvas", selector: {type: "shape", id: createShapeId("andre-vacha")}, effect: "ripple", callback: () => {
                // start moving the redwoods out and widening the field of view
                redwoodMeshes.map(mesh => customFadeOut(mesh, 1.5))
                
                camera.animations.push(fovAnimation);

                // Start the FOV animation after rotation animations complete
                scene.beginDirectAnimation(camera, [fovAnimation], 0, fovAnimationDuration * framerate, false);
                }
            })

        });
    }
}


export function createFocusButton(scene, camera, advancedTexture, triggerEffect) {
    function focusOnConstellationCanvas(scene, camera) {
        // focusAndMoveToConstellationCanvas(scene, camera);
        focusWithoutMovingToConstellationCanvas(scene, camera, triggerEffect)
    }

    // Add GUI and button
    const button = GUI.Button.CreateSimpleButton("focusButton", "Focus on Constellations");
    button.width = "150px";
    button.height = "40px";
    button.color = "white";
    button.cornerRadius = 20;
    button.background = "green";
    button.onPointerUpObservable.add(() => focusOnConstellationCanvas(scene, camera));
    button.pointerEvents = "auto";

    // Position the button at the bottom center
    button.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    button.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;

    advancedTexture.addControl(button);
}

export function createCanvasControlsButton(scene, advancedTexture){
    let elementFocused = false;    

    const toggleButton = GUI.Button.CreateSimpleButton("toggleButton", "Give Control to Constellations");
    toggleButton.width = "150px";
    toggleButton.height = "40px";
    toggleButton.color = "white";
    toggleButton.cornerRadius = 20;
    toggleButton.background = "blue";
    toggleButton.onPointerUpObservable.add(() => toggleControl());
    toggleButton.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    toggleButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    toggleButton.left = "160px"; // Adjust this value to position the button above the focus button
    toggleButton.pointerEvents = "auto";
    advancedTexture.addControl(toggleButton);

    function toggleControl() {
        document.body.style.pointerEvents = 'none';
    }

}

export function createResetButton(scene, advancedTexture){

    const resetButton = GUI.Button.CreateSimpleButton("resetButton", "Reset Everything");
    resetButton.width = "150px";
    resetButton.height = "40px";
    resetButton.color = "white";
    resetButton.cornerRadius = 20;
    resetButton.background = "blue";
    resetButton.onPointerUpObservable.add(() => resetScene());
    resetButton.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    resetButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    resetButton.left = "300px"; // Adjust this value to position the button above the focus button
    resetButton.pointerEvents = "auto";
    advancedTexture.addControl(resetButton);

    function resetScene() {
        const camera = scene.cameras.find(camera => camera.name === "babylon-camera");
        camera.position = new BABYLON.Vector3(0, 5, 12);
        camera.rotation = new BABYLON.Vector3(0, 0, 0);
        camera.fov = 0.8 // default value for fov
        camera.setTarget(new BABYLON.Vector3(0, 0, 0));

        // fade in all redwoods that have faded out
        const redwoodMeshes = scene.meshes.filter(mesh => mesh.name && mesh.name.includes('redwood'));
        redwoodMeshes.map(mesh => customFadeIn(mesh, 1))
    }

}