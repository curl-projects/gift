import * as GUI from '@babylonjs/gui';
import * as BABYLON from '@babylonjs/core';
import { Matrix } from '@babylonjs/core';
import { framerate, Epsilon } from './constants';
import { customFadeIn, customFadeOut } from './mesh-behaviours';
import { createShapeId } from "tldraw";
import { focusWithoutMovingToConstellationCanvas, giveControlToCanvas } from '~/components/environment/event-controllers/campfire-transition';

export function createFullscreenUI() {
    return GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
}

export function createFocusButton(scene, camera, advancedTexture, triggerEffect, setTriggerWarp) {
    function focusOnConstellationCanvas(scene, camera) {
        // focusAndMoveToConstellationCanvas(scene, camera);
        focusWithoutMovingToConstellationCanvas(scene, camera, triggerEffect, setTriggerWarp)
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
    toggleButton.onPointerUpObservable.add(() => giveControlToCanvas());
    toggleButton.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    toggleButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    toggleButton.left = "160px"; // Adjust this value to position the button above the focus button
    toggleButton.pointerEvents = "auto";
    advancedTexture.addControl(toggleButton);

   

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