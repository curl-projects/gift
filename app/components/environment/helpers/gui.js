import * as GUI from '@babylonjs/gui';
import * as BABYLON from '@babylonjs/core';


export function createFullscreenUI() {
    return GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
}

export function createFocusButton(scene, camera, advancedTexture) {
    function focusOnConstellationCanvas(scene, camera) {
        const constellationCanvas = scene.getMeshByName('constellationCanvas');
        if (constellationCanvas) {
            // Get the bounding box of the constellation canvas
            const boundingInfo = constellationCanvas.getBoundingInfo();
            const boundingBox = boundingInfo.boundingBox;
    
            // Calculate the dimensions of the canvas
            const canvasWidth = constellationCanvas.scaling.x
            const canvasHeight = constellationCanvas.scaling.y
    
    
            // Calculate the required FOV to fit the canvas height
            const fovY = 2 * Math.atan((canvasHeight / 2) / camera.position.length());
    
      

            const canvasNormal = constellationCanvas.forward; // this should be up if vertical and forward if looking down
            const distanceToCanvas = (canvasHeight / 2) / Math.tan(fovY / 2);
            console.log("CANVASHEIGHT", canvasHeight)
            const newPosition = constellationCanvas.position.subtract(canvasNormal.scale(distanceToCanvas));
    
            // Calculate the new camera target
            const newTarget = constellationCanvas.position;
            // camera.setTarget(newTarget)
            
            // Animate the camera to its new position and orientation
            const animationDuration = 1000; // milliseconds
            const framerate = 60;
            const ease = new BABYLON.CubicEase();
            ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

            // Create animations
            // const positionAnimation = BABYLON.Animation.CreateAndStartAnimation('cameraMove', camera, 'position', framerate, animationDuration / (1000 / framerate), camera.position, newPosition, 0, ease);
            const targetAnimation = new BABYLON.Animation('cameraTarget', 'target', framerate, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
            // const fovAnimation = BABYLON.Animation.CreateAndStartAnimation('cameraFOV', camera, 'fov', framerate, animationDuration / (1000 / framerate), camera.fov, fovY, 0, ease);

            // Set keyframes for target animation
            const targetKeys = [];
            targetKeys.push({ frame: 0, value: camera.target });
            targetKeys.push({ frame: animationDuration / (1000 / framerate), value: constellationCanvas.position });
            targetAnimation.setKeys(targetKeys);
            targetAnimation.setEasingFunction(ease);

            // Start the target animation
            scene.beginDirectAnimation(camera, [targetAnimation], 0, animationDuration / (1000 / framerate), false);

            // Play the animations
            // positionAnimation.start();
            // targetAnimation.start();
            // fovAnimation.start();

            // Create an animation group
            // const animationGroup = new BABYLON.AnimationGroup("cameraAnimations");
            // // animationGroup.addTargetedAnimation(positionAnimation, camera);
            // animationGroup.addTargetedAnimation(targetAnimation, camera);
            // // animationGroup.addTargetedAnimation(fovAnimation, camera);

            // // Start the animation group
            // animationGroup.play();
        }
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