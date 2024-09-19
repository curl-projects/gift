import * as GUI from '@babylonjs/gui';
import * as BABYLON from '@babylonjs/core';
import { Matrix } from '@babylonjs/core';
import { framerate, Epsilon } from '~/components/environment/helpers/constants';
// import { customFadeIn, customFadeOut } from '~/components/environment/helpers/mesh-behaviours';
import { createShapeId } from "tldraw";

export function giveControlToCanvas() {
    document.body.style.pointerEvents = 'none';
}

// export function giveControlToCanvas() {
//     const elementsToDisable = document.querySelectorAll('.disable-pointer-events');
//     elementsToDisable.forEach(element => {
//         element.style.pointerEvents = 'none';
//     });
// }

export function giveControlToEnvironment(){
    document.body.style.pointerEvents = 'auto';
    document.body.style.overflow = 'unset';
}


// export function giveControlToEnvironment() {
//     const elementsToEnable = document.querySelectorAll('.disable-pointer-events');
//     elementsToEnable.forEach(element => {
//         element.style.pointerEvents = 'auto';
//     });
//     document.body.style.overflow = 'unset';
// }

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
    // camera._camMatrix.invert();

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

    const targetQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(targetRotationY, targetRotationX, targetRotationZ);

    return { targetQuaternion };
}


// custom fade behaviour
export function customFadeOut(mesh, scene, animationDuration = 3, immediate = false) {
    if (immediate) {
        // Directly set the scaling properties of the mesh
        mesh.scaling.x *= 0.3;
        mesh.scaling.y *= 0.01;
    } else {

        const initialScaling = { x: mesh.scaling.x, y: mesh.scaling.y, z: mesh.scaling.z };
        const finalScaling = { x: mesh.scaling.x * 0.3, y: mesh.scaling.y * 0.01, z: mesh.scaling.z };

        console.log("INITIAL SCALING:", initialScaling)
        console.log("FINAL SCALING:", finalScaling)
        const ease = new BABYLON.CubicEase();
        // ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
        const fade = new BABYLON.Animation('fade', 'scaling', framerate, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        
        // Set key frames based on the reverse parameter
        const keyFrames = [
            { frame: 0, value: new BABYLON.Vector3(initialScaling.x, initialScaling.y, initialScaling.z) },
            { frame: animationDuration * framerate, value: new BABYLON.Vector3(finalScaling.x, finalScaling.y, finalScaling.z) }
        ];

        fade.setKeys(keyFrames);
        fade.setEasingFunction(ease);

        mesh.animations.push(fade);


        console.log("TRIGGERING ANIMATION")

        scene.beginDirectAnimation(mesh, [fade], 0, animationDuration * framerate, false, 1, () => {
            console.log("ANIMATION FINISHED")
        });

        return fade;
    }
}

export function customFadeIn(mesh, scene, animationDuration = 1.5, immediate = false) {
    if (immediate) {
        // Directly set the scaling properties of the mesh
        mesh.scaling.x /= 0.3;
        mesh.scaling.y /= 0.01;
    } else {

        const initialScaling = { x: mesh.scaling.x, y: mesh.scaling.y, z: mesh.scaling.z };
        const finalScaling = { x: mesh.scaling.x / 0.3, y: mesh.scaling.y / 0.01, z: mesh.scaling.z };
        const ease = new BABYLON.CubicEase();
        ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

        const fade = new BABYLON.Animation('fade', 'scaling', framerate, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        
        // Set key frames based on the reverse parameter
        const keyFrames = [
            { frame: 0, value: new BABYLON.Vector3(initialScaling.x, initialScaling.y, initialScaling.z) },
            { frame: animationDuration * framerate, value: new BABYLON.Vector3(finalScaling.x, finalScaling.y, finalScaling.z) }
        ];

        fade.setKeys(keyFrames);
        fade.setEasingFunction(ease);

        mesh.animations.push(fade);


        console.log("TRIGGERING ANIMATION")

        scene.beginDirectAnimation(mesh, [fade], 0, animationDuration * framerate, false);

        return fade;
    }
}


export function focusWithoutMovingToConstellationCanvas(scene, camera, triggerEffect, treeScale=true) {
    return new Promise((resolve) => {
        const constellationCanvas = scene.getMeshByName('constellationCanvas');
        if (constellationCanvas) {
            const target = constellationCanvas.position;

            const { targetQuaternion } = calculateNewTargetRotations(camera, target);

            console.log("targetQuaternion", targetQuaternion);
            const newFov = calculateNewFovWithoutPosition(camera, constellationCanvas);

            const ease = new BABYLON.CubicEase();
            ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

            // Ensure the camera has a valid initial rotation quaternion
            if (!camera.rotationQuaternion) {
                camera.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(camera.rotation.x, camera.rotation.y, camera.rotation.z);
            }

            // Normalize the quaternions
            camera.rotationQuaternion.normalize();
            targetQuaternion.normalize();

            // Create animation for rotation quaternion
            const rotationQuaternionAnimation = new BABYLON.Animation("rotationQuaternionAnimation", "rotationQuaternion", framerate, BABYLON.Animation.ANIMATIONTYPE_QUATERNION, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

            // Create animation for FOV
            const fovAnimation = new BABYLON.Animation("fovAnimation", "fov", framerate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

            const targetAnimationDuration = 2;
            const fovAnimationDuration = 3;

            // Set key frames for rotation quaternion
            const keyFramesQuaternion = [
                { frame: 0, value: camera.rotationQuaternion.clone() },
                { frame: targetAnimationDuration * framerate, value: targetQuaternion }
            ];

            // Set key frames for FOV
            const fovKeyFrames = [
                { frame: 0, value: camera.fov },
                { frame: fovAnimationDuration * framerate, value: newFov }
            ];

            rotationQuaternionAnimation.setKeys(keyFramesQuaternion);
            fovAnimation.setKeys(fovKeyFrames);

            rotationQuaternionAnimation.setEasingFunction(ease);
            fovAnimation.setEasingFunction(ease);

            // Add rotation quaternion animation to camera
            camera.animations.push(rotationQuaternionAnimation);

            console.log("SCENE MESHES:", scene.meshes);

            const redwoodMeshes = scene.meshes.filter(mesh => mesh.name && mesh.name.includes('redwood'));

            console.log("REDWOOD MESHES:", redwoodMeshes);

            // Start the rotation quaternion animation
            scene.beginDirectAnimation(camera, [rotationQuaternionAnimation], 0, targetAnimationDuration * framerate, false, 1, () => {
                // wait for the star to trigger
                triggerEffect({domain: "canvas", selector: {type: "shape", id: createShapeId("andre-vacha")}, effect: "ripple", callback: () => {
                    // start moving the redwoods out and widening the field of view
                    treeScale && redwoodMeshes.map(mesh => customFadeOut(mesh, scene, 1.5, false));

                    camera.animations.push(fovAnimation);

                    // Start the FOV animation after rotation animations complete
                    scene.beginDirectAnimation(camera, [fovAnimation], 0, fovAnimationDuration * framerate, false, 1, () => {
                        giveControlToCanvas();

                        const engine = scene.getEngine();
                        engine.stopRenderLoop();

                      
                        resolve(); // Resolve the promise when all animations are complete
                    });
                }});
            });
        } else {
            console.error("Constellation Canvas not found")
            resolve(); // Resolve immediately if constellationCanvas is not found
        }
    });
}

export function unfocusFromConstellationCanvas(scene, camera, triggerEffect, onRender, treeScale=true, targetMeshName = 'campfire', targetPosition = null, targetFov = 0.8, useTargetPosition = false) {
    return new Promise((resolve) => {

        var target;
        
        if(useTargetPosition){
            target = targetPosition;
        }
        else{
            const targetMesh = scene.getMeshByName(targetMeshName);
            target = targetMesh.position;
            console.warn("TARGET MESH POSITION:", target)
        }

        if (target) {

            const engine = scene.getEngine();

            engine.runRenderLoop(() => {
                if (typeof onRender === 'function') onRender(scene);
                scene.render()
            });

            const { targetQuaternion } = calculateNewTargetRotations(camera, target);

            const newFov = targetFov;
        

            const ease = new BABYLON.CubicEase();
            ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

            // Ensure the camera has a valid initial rotation quaternion
            if (!camera.rotationQuaternion) {
                camera.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(camera.rotation.x, camera.rotation.y, camera.rotation.z);
            }

            // Normalize the quaternions
            camera.rotationQuaternion.normalize();
            targetQuaternion.normalize();

            // Create animation for rotation quaternion
            const rotationQuaternionAnimation = new BABYLON.Animation("rotationQuaternionAnimation", "rotationQuaternion", framerate, BABYLON.Animation.ANIMATIONTYPE_QUATERNION, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

            // Create animation for FOV
            const fovAnimation = new BABYLON.Animation("fovAnimation", "fov", framerate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

            const targetAnimationDuration = 2;
            const fovAnimationDuration = 3;

            // Set key frames for rotation quaternion
            const keyFramesQuaternion = [
                { frame: 0, value: camera.rotationQuaternion.clone() },
                { frame: targetAnimationDuration * framerate, value: targetQuaternion }
            ];

            // Set key frames for FOV
            const fovKeyFrames = [
                { frame: 0, value: camera.fov },
                { frame: fovAnimationDuration * framerate, value: newFov }
            ];

            rotationQuaternionAnimation.setKeys(keyFramesQuaternion);
            fovAnimation.setKeys(fovKeyFrames);

            rotationQuaternionAnimation.setEasingFunction(ease);
            fovAnimation.setEasingFunction(ease);

            // Add rotation quaternion animation to camera
            camera.animations.push(rotationQuaternionAnimation);

            console.log("SCENE MESHES:", scene.meshes);
        
            triggerEffect({domain: "canvas", selector: {type: "shape", id: createShapeId("andre-vacha")}, effect: "ripple", callback: () => {
                const redwoodMeshes = scene.meshes.filter(mesh => mesh.name && mesh.name.includes('redwood'));

                console.log("REDWOOD MESHES:", redwoodMeshes);
                treeScale && redwoodMeshes.map(mesh => customFadeIn(mesh, scene, 3, false));
    
                scene.beginDirectAnimation(camera, [fovAnimation], 0, fovAnimationDuration * framerate, false, 1, () => {
                    scene.beginDirectAnimation(camera, [rotationQuaternionAnimation], 0, targetAnimationDuration * framerate, false, 1, () => {
                        giveControlToEnvironment()
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

export function unfocusFromConstellationCanvasImmediately(scene, camera, onRender, treeScale=true, targetMeshName = 'campfire', targetPosition = null, targetFov = 0.8, useTargetPosition = true) {
    return new Promise((resolve) => {
        console.log("IMMEDIATELY UNFOCUSING")
        const engine = scene.getEngine();
        engine.runRenderLoop(() => {
            if (typeof onRender === 'function') onRender(scene);
            scene.render();
        });


        var target;

        if(useTargetPosition){
            target = targetPosition;
        }
        else{
            const targetMesh = scene.meshes.find(mesh => mesh.name && mesh.name === targetMeshName);
            target = targetMesh.position;
            console.warn("TARGET MESH POSITION:", target)
        }

        if (target) {
            // for some reason you have to add the height into the calculation
            const { targetQuaternion } = calculateNewTargetRotations(camera, target);

            const newFov = targetFov;
       

            camera.rotationQuaternion = targetQuaternion;
            camera.fov = newFov;

            console.log("Camera unfocused from constellation canvas immediately."); 

            // Handle redwood meshes scaling
            const redwoodMeshes = scene.meshes.filter(mesh => mesh.name && mesh.name.includes('redwood'));
            console.log("REDWOOD MESHES:", redwoodMeshes);
            treeScale && redwoodMeshes.forEach(mesh => customFadeIn(mesh, scene, 3, true)); // Directly apply the fade in effect


            giveControlToEnvironment();

            resolve();
        } else {
            console.error(`${targetMeshName} not found`);
            resolve();
        }
    });
}

function setSPSOpacityToZero(scene) {
    for(let mesh of scene.meshes){
        if (mesh instanceof BABYLON.SolidParticleSystem) {
            console.warn("MESH:", mesh)
            if (mesh.material) {
                console.warn("MATERIAL:", mesh.material)
                mesh.material.alpha = 0;
            }
        }
    }
}


export function initializeLookingAtSky(scene, camera, treeScale=true){
    return new Promise((resolve, reject) => {
        const constellationCanvas = scene.getMeshByName('constellationCanvas');
        if (constellationCanvas) {

            const target = constellationCanvas.position;

            const { targetQuaternion } = calculateNewTargetRotations(camera, target);

            console.log("targetQuaternion", targetQuaternion);

            const newFov = calculateNewFovWithoutPosition(camera, constellationCanvas);

            // Directly set the camera's rotation and FOV
            camera.rotationQuaternion = targetQuaternion;
            camera.fov = newFov;

            console.log("Camera initialized to look at the sky without animation.");

            // Handle redwood meshes scaling
            const redwoodMeshes = scene.meshes.filter(mesh => mesh.name && mesh.name.includes('redwood'));
            console.log("REDWOOD MESHES:", redwoodMeshes);
            treeScale && redwoodMeshes.forEach(mesh => customFadeOut(mesh, scene, 1.5, true)); // Directly apply the fade out effect

            // giveControlToCanvas();

            // after all effect have finished, freeze the canvas
            setTimeout(() => {
                const engine = scene.getEngine();
                engine.stopRenderLoop();
                resolve(); // Resolve the promise when all operations are complete
            }, 100);
        } else {
            console.error("Constellation Canvas not found");
            reject("Constellation Canvas not found"); // Reject the promise if constellationCanvas is not found
        }
    });
}




















// OLD FUNCS (USED FOR POSITIONAL MOVEMENT)

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

        const { targetQuaternion } = calculateNewTargetRotations(camera, target);

        console.log("targetQuaternion", targetQuaternion)
       
       
        const { newPosition, newFov } = calculateNewPositionAndFov(camera, constellationCanvas);

        const ease = new BABYLON.CubicEase();
        ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

        // Create animation for rotation quaternion
        const rotationQuaternionAnimation = new BABYLON.Animation("rotationQuaternionAnimation", "rotationQuaternion", framerate, BABYLON.Animation.ANIMATIONTYPE_QUATERNION, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        
        // // Create animations for position and fov
        const positionAnimation = new BABYLON.Animation("positionAnimation", "position", framerate, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        const fovAnimation = new BABYLON.Animation("fovAnimation", "fov", framerate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

        // Set key frames for rotation quaternion
        const keyFramesQuaternion = [
            { frame: 0, value: camera.rotationQuaternion.clone() },
            { frame: 1 * framerate, value: targetQuaternion }
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


        rotationQuaternionAnimation.setKeys(keyFramesQuaternion);
        positionAnimation.setKeys(positionKeyFrames);
        fovAnimation.setKeys(fovKeyFrames);

        rotationQuaternionAnimation.setEasingFunction(ease);
        positionAnimation.setEasingFunction(ease);
        fovAnimation.setEasingFunction(ease);


        // Add animations to camera
        camera.animations.push(rotationQuaternionAnimation);
        camera.animations.push(positionAnimation);
        camera.animations.push(fovAnimation);


        // Start the animation
        scene.beginDirectAnimation(camera, [rotationQuaternionAnimation, positionAnimation, fovAnimation], 0, 1 * framerate, false);
    }
}

