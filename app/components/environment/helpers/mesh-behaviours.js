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
export function customFadeOut(mesh, animationDuration = 1.5, immediate = false) {
    if (immediate) {
        // Directly set the scaling properties of the mesh
        mesh.scaling.x *= 0.3;
        mesh.scaling.y *= 0.01;
        mesh.scaling.z *= 0.3; // Assuming you want to scale z as well, similar to x
    } else {
        const ease = new BABYLON.CubicEase();
        ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

        const fadeOutGroup = new BABYLON.AnimationGroup("fadeOutGroup");

        const fadeOutOne = new BABYLON.Animation('fadeOut', 'scaling', framerate, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT, ease);
        fadeOutOne.setKeys([
            { frame: 0, value: new BABYLON.Vector3(mesh.scaling.x, mesh.scaling.y, mesh.scaling.z) },
            { frame: animationDuration * framerate, value: new BABYLON.Vector3(mesh.scaling.x * 0.3, mesh.scaling.y * 0.01, mesh.scaling.z) }
        ]);
        fadeOutOne.setEasingFunction(ease);

        fadeOutGroup.addTargetedAnimation(fadeOutOne, mesh);
        fadeOutGroup.play();

        return fadeOutGroup;
    }
}
export function customFadeIn(mesh, animationDuration){
    const ease = new BABYLON.CubicEase();
    ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

    const fadeIn = BABYLON.Animation.CreateAndStartAnimation('fadeIn', mesh.material, 'alpha', framerate, animationDuration * framerate, 0, 1, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT, ease);
    return fadeIn
}