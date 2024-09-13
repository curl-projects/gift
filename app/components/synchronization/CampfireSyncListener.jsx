import { useStarFireSync } from '~/components/synchronization/StarFireSync';
import { useEffect } from 'react';
import { focusWithoutMovingToConstellationCanvas, 
         giveControlToCanvas,
         unfocusFromConstellationCanvas,
         unfocusFromConstellationCanvasImmediately,
         initializeLookingAtSky,
        } from '~/components/environment/event-controllers/campfire-transition';

export function CampfireSyncListener({ scene, onRender }){
    const { triggerEffect, activeEffect, setTriggerWarp, campfireView, setCampfireView, sceneLoaded } = useStarFireSync();

    useEffect(() => {
        console.log("CAMPFIRE VIEW", campfireView)
        const camera = scene.cameras.find(camera => camera.name === "babylon-camera")
        if(sceneLoaded && campfireView){
            if(campfireView?.active){
                if(campfireView.immediate){
                    unfocusFromConstellationCanvasImmediately(scene, camera, triggerEffect, setTriggerWarp).then(()=>
                        campfireView.onComplete && campfireView.onComplete()
                    )
                    
                }
                else{
                    unfocusFromConstellationCanvas(scene, camera, triggerEffect, setTriggerWarp).then(()=>
                        campfireView.onComplete && campfireView.onComplete()
                    )
                }
                
            }
            else {
                if(campfireView.immediate){
                    initializeLookingAtSky(scene, camera).then(()=>
                        campfireView.onComplete && campfireView.onComplete()
                    )
                }
                else{
                    focusWithoutMovingToConstellationCanvas(scene, camera, triggerEffect, setTriggerWarp).then(()=>
                        campfireView.onComplete && campfireView.onComplete()
                    )
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