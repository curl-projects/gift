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
            const canvasWidth = boundingBox.maximumWorld.x - boundingBox.minimumWorld.x;
            const canvasHeight = boundingBox.maximumWorld.y - boundingBox.minimumWorld.y;
    
            // Calculate the aspect ratio of the canvas
            const canvasAspectRatio = canvasWidth / canvasHeight;
    
            // Calculate the required FOV to fit the canvas height
            const fovY = 2 * Math.atan((canvasHeight / 2) / camera.position.length());
    
            // Set the camera's FOV and aspect ratio
            // camera.fov = fovY;
            // camera.aspectRatio = canvasAspectRatio;
    
            // Calculate the new camera position
            const canvasNormal = constellationCanvas.forward;
            const distanceToCanvas = (canvasHeight / 2) / Math.tan(fovY / 2);
            const newPosition = constellationCanvas.position.subtract(canvasNormal.scale(distanceToCanvas));
    
            // Animate the camera to its new position and orientation
            const animationDuration = 1000; // milliseconds
            const framerate = 60;
            const ease = new BABYLON.CubicEase();
            ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    
            // Create animations
            const positionAnimation = BABYLON.Animation.CreateAndStartAnimation('cameraMove', camera, 'position', framerate, animationDuration / (1000 / framerate), camera.position, newPosition, 0, ease);
            const targetAnimation = BABYLON.Animation.CreateAndStartAnimation('cameraTarget', camera, 'target', framerate, animationDuration / (1000 / framerate), camera.target, constellationCanvas.position, 0, ease);
            const fovAnimation = BABYLON.Animation.CreateAndStartAnimation('cameraFOV', camera, 'fov', framerate, animationDuration / (1000 / framerate), camera.fov, fovY, 0, ease);
    
            // Ensure the aspect ratio is set after the animation completes
            // positionAnimation.onAnimationEnd = () => {
            //     camera.aspectRatio = canvasAspectRatio;
            // };
        }
    }

    // Add GUI and button
    const button = GUI.Button.CreateSimpleButton("focusButton", "Focus on Canvas");
    button.width = "150px";
    button.height = "40px";
    button.color = "white";
    button.cornerRadius = 20;
    button.background = "green";
    button.onPointerUpObservable.add(() => focusOnConstellationCanvas(scene, camera));
    
    // Position the button at the bottom center
    button.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    button.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;

    advancedTexture.addControl(button);
}

export function createCanvasControlsButton(scene, advancedTexture){
    let elementFocused = false;    

    const toggleButton = GUI.Button.CreateSimpleButton("toggleButton", "Toggle Control");
    toggleButton.width = "150px";
    toggleButton.height = "40px";
    toggleButton.color = "white";
    toggleButton.cornerRadius = 20;
    toggleButton.background = "blue";
    toggleButton.onPointerUpObservable.add(() => toggleControl());
    toggleButton.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    toggleButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    toggleButton.left = "160px"; // Adjust this value to position the button above the focus button
    advancedTexture.addControl(toggleButton);

    function toggleControl() {
        elementFocused = !elementFocused;
        if (elementFocused) {
            document.body.style.pointerEvents = 'none';
            console.log("Control given to constellation canvas");
        } else {
            document.body.style.pointerEvents = 'auto';
            document.body.style.overflow = 'unset';
            console.log("Control given to Babylon.js canvas");
        }
    }

}