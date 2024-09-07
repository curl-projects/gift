import * as GUI from '@babylonjs/gui';
import * as BABYLON from '@babylonjs/core';


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
        camera.fov = fovY;
        camera.aspectRatio = canvasAspectRatio;

        // Calculate the new camera position
        const canvasNormal = constellationCanvas.forward;
        const distanceToCanvas = (canvasHeight / 2) / Math.tan(fovY / 2);
        const newPosition = constellationCanvas.position.subtract(canvasNormal.scale(distanceToCanvas));

        // Animate the camera to its new position and orientation
        const animationDuration = 1000; // milliseconds
        const framerate = 60;
        const ease = new BABYLON.CubicEase();
        ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

        BABYLON.Animation.CreateAndStartAnimation('cameraMove', camera, 'position', framerate, animationDuration / (1000 / framerate), camera.position, newPosition, 0, ease);
        BABYLON.Animation.CreateAndStartAnimation('cameraTarget', camera, 'target', framerate, animationDuration / (1000 / framerate), camera.target, constellationCanvas.position, 0, ease);
        BABYLON.Animation.CreateAndStartAnimation('cameraFOV', camera, 'fov', framerate, animationDuration / (1000 / framerate), camera.fov, fovY, 0, ease);
    }
}

// function focusOnConstellationCanvas(scene, camera) {
//     const constellationCanvas = scene.getMeshByName('constellationCanvas');
//     console.log("constellationCanvas", constellationCanvas)
//     if (constellationCanvas) {
//         camera.update()
//         // camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA

//         var tar = constellationCanvas
//         var targetEndPos = tar.getAbsolutePosition();
//         var camEndPos = tar.getAbsolutePosition();
//         var speed = 45;
//         var ease = new BABYLON.CubicEase();

//         tar.computeWorldMatrix();
//         var matrix = tar.getWorldMatrix(true);
//         var local_position = new BABYLON.Vector3(0,0,0);
//         local_position.addInPlace(new BABYLON.Vector3(0, 0, -20));
//         var global_position = BABYLON.Vector3.TransformCoordinates(local_position, matrix);
//         console.log(global_position);
//         // camera.position = global_position;
//         // camera.parent = tar;
//         ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
//         BABYLON.Animation.CreateAndStartAnimation('at4', camera, 'position', speed, 120, camera.position, global_position, 0, ease);
//         BABYLON.Animation.CreateAndStartAnimation('at5', camera, 'target', speed, 120, camera.target, targetEndPos, 0, ease);




//         // const boundingInfo = constellationCanvas.getBoundingInfo();
//         // const boundingBox = boundingInfo.boundingBox;

//         // // Get the dimensions of the bounding box
//         // const canvasWidth = boundingBox.maximumWorld.x - boundingBox.minimumWorld.x;
//         // const canvasHeight = boundingBox.maximumWorld.y - boundingBox.minimumWorld.y;

//         // // Calculate the aspect ratio of the canvas
//         // const canvasAspectRatio = canvasWidth / canvasHeight;

//         // // Get the camera's FOV in radians
//         // const fovRadians = camera.fov;

//         // // Calculate the required distance to fit the height of the canvas
//         // const distanceToFitHeight = (canvasHeight / 2) / Math.tan(fovRadians / 2);

//         // // Calculate the required distance to fit the width of the canvas
//         // const distanceToFitWidth = (canvasWidth / 2) / (Math.tan(fovRadians / 2) * canvasAspectRatio);

//         // console.log("DISTANCES:", distanceToFitHeight, distanceToFitWidth)
//         // // Use the larger distance to ensure the entire canvas fits in view
//         // const cameraDistance = Math.max(distanceToFitHeight, distanceToFitWidth);

//         // // Calculate the new camera position
//         // const direction = constellationCanvas.position.subtract(camera.position).normalize();
//         // const newPosition = constellationCanvas.position.subtract(direction.scale(cameraDistance));


//         // camera.position = newPosition;

//         // // Orient the camera to look at the center of the constellation canvas
//         // camera.setTarget(constellationCanvas.position);

//         // console.log("DIRECTION:", direction, "NEW POSITION:", newPosition)

//         // camera.position = newPosition;
//         // // Create and run the animation
//         // const animationDuration = 1000; // milliseconds
//         // const framerate = 60;

//         // // Create animation for camera position
//         // const positionAnimation = new BABYLON.Animation(
//         //     "cameraPosition",
//         //     "position",
//         //     framerate,
//         //     BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
//         //     BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
//         // );

//         // const targetPosition = newPosition;
//         // const positionKeys = [
//         //     { frame: 0, value: camera.position.clone() },
//         //     { frame: framerate, value: targetPosition }
//         // ];
//         // positionAnimation.setKeys(positionKeys);

//         // // Create animation for camera target
//         // const targetAnimation = new BABYLON.Animation(
//         //     "cameraTarget",
//         //     "target",
//         //     framerate,
//         //     BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
//         //     BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
//         // );

//         // const targetKeys = [
//         //     { frame: 0, value: camera.target.clone() },
//         //     { frame: framerate, value: newPosition }
//         // ];
//         // targetAnimation.setKeys(targetKeys);

//         // // Run the animation
//         // scene.beginDirectAnimation(camera, [positionAnimation, targetAnimation], 0, framerate, false, 1.0);
//     // }
//     }
// }

export function createFocusButton(scene, camera) {
    // Add GUI and button
    const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
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
    button.top = "-20px"; // Adjust this value to fine-tune the distance from the bottom

    advancedTexture.addControl(button);
}