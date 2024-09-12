import { useStarFireSync } from '~/components/synchronization/StarFireSync';
import { useEffect } from 'react';
import { focusWithoutMovingToConstellationCanvas, giveControlToCanvas } from '~/components/environment/event-controllers/campfire-transition';

export function CampfireSyncListener({ scene }){
    const { triggerEffect, activeEffect, setTriggerWarp, campfireView, setCampfireView } = useStarFireSync();

    // useEffect(() => {
    //     if(!campfireView){
    //         // trigger campfire view
    //         focusWithoutMovingToConstellationCanvas(scene, camera, triggerEffect, setTriggerWarp).then(() => {
    //         giveControlToCanvas()
    //         setCampfireView(true)
    //         })

    //     }
    // }, [campfireView])


    // useEffect(() => {
    //     if(scene){
    //         setTimeout(() => {
    //             console.log("TRIGGERED!")
    //             const camera = scene.cameras.find(camera => camera.name === "babylon-camera")
    //             focusWithoutMovingToConstellationCanvas(scene, camera, triggerEffect, setTriggerWarp).then(() => {
    //             // giveControlToCanvas()
    //             setCampfireView(true)
    //         })
    //     }, 2000)
    //     }  
    // }, [])

    return null
}