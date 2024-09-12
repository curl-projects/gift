import * as BABYLON from '@babylonjs/core';
import { framerate } from './constants';

export function createFadeBehaviour(scene){
    const fadeBehaviour = new BABYLON.FadeInOutBehavior();
    fadeBehaviour.fadeInTime = 1000;
    fadeBehaviour.fadeOutTime = 1000;
    fadeBehaviour.fadeOutDelay = 0;
    fadeBehaviour.fadeInDelay = 0;
    // fadeBehaviour.fadeInEasingFunction = BABYLON.EasingFunction.QuadraticEase;
    // fadeBehaviour.fadeOutEasingFunction = BABYLON.EasingFunction.QuadraticEase;
    return fadeBehaviour;
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

