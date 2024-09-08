import * as BABYLON from '@babylonjs/core';
import HavokPhysics from "@babylonjs/havok";

export async function enableFloatingPhysics(scene){
    const havokInstance = await HavokPhysics();
    const havokPlugin = new BABYLON.HavokPlugin(true, havokInstance);

    const gravityVector = new BABYLON.Vector3(0, 0, 0);
    scene.enablePhysics(gravityVector, havokPlugin);
}