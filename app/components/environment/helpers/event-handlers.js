function meshIsVisible(scene, props){
    const camera = scene.cameras.find(cam => cam.name === "babylon-camera");
    const mesh = scene.meshes.find(mesh => mesh.name === props.meshName);
    return camera.isInFrustum(mesh)
}

function cameraMoved(scene, props){
    const camera = scene.getCameraByName("babylon-camera")

    const observer = camera.onViewMatrixChangedObservable.add(() => {

        console.log("Camera moved");
        camera.onViewMatrixChangedObservable.remove(observer);
        return true;
    });    

}

const eventMap = {
    "mesh-visible": meshIsVisible,
    "camera-moved": cameraMoved
}

export function addCommandEventListener(scene, commandEvent, canvasProps={}) {
    const { eventType, props } = commandEvent;

    // incorporates parameters from both the canvas and the synchronizer
    const eventProps = {...props, ...canvasProps}

    const eventHandler = scene.onBeforeRenderObservable.add(() => {
        if(!eventMap[eventType]){
            console.error("Event type not found in event map", eventType)
            scene.onBeforeRenderObservable.remove(eventHandler);
            return false;
        }

        if(eventMap[eventType](scene, eventProps)){
            console.log("Event Triggered")
            scene.onBeforeRenderObservable.remove(eventHandler);
            commandEvent.onComplete && commandEvent.onComplete();
            return true;
        }

        return false;
    })
}

