import { useStarFireSync } from '~/components/synchronization/StarFireSync';
import { useEffect } from 'react';
import { focusWithoutMovingToConstellationCanvas, 
         giveControlToCanvas,
         unfocusFromConstellationCanvas,
         initializeLookingAtSky,
        } from '~/components/environment/event-controllers/campfire-transition';

export function CampfireSyncListener({ scene, onRender }){
    const { triggerEffect, activeEffect, setTriggerWarp, campfireView, setCampfireView, sceneLoaded } = useStarFireSync();

    useEffect(() => {
        const camera = scene.cameras.find(camera => camera.name === "babylon-camera")
        if(sceneLoaded && campfireView){
            if(campfireView?.active){
                unfocusFromConstellationCanvas(scene, camera, triggerEffect, setTriggerWarp)
            }
            else {
                if(campfireView.immediate){
                    initializeLookingAtSky(scene, camera)
                }
                else{
                    focusWithoutMovingToConstellationCanvas(scene, camera, triggerEffect, setTriggerWarp)
                }   
            }
        }
    }, [sceneLoaded, campfireView])


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