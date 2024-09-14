import { useStarFireSync } from '~/components/synchronization/StarFireSync';
import { useEffect } from 'react';
import { focusWithoutMovingToConstellationCanvas, 
         giveControlToCanvas,
         unfocusFromConstellationCanvas,
         unfocusFromConstellationCanvasImmediately,
         initializeLookingAtSky,
         giveControlToEnvironment,
        } from '~/components/environment/event-controllers/campfire-transition';

export function CampfireSyncListener({ scene, onRender }){
    const { triggerEffect, activeEffect, setTriggerWarp, campfireView, setCampfireView, sceneLoaded } = useStarFireSync();



    useEffect(() => {

        const camera = scene.getCameraByName("babylon-camera")
        
      
        if(sceneLoaded && campfireView){
            console.log("CAMPFIRE VIEW", campfireView)

            const treeScale = campfireView?.treeScale !== undefined ? campfireView.treeScale : true;
            const targetMeshName = campfireView?.targetMeshName !== undefined ? campfireView.targetMeshName : 'campfire';


            if(campfireView.active){
                if(campfireView.immediate){
                    unfocusFromConstellationCanvasImmediately(scene, camera, onRender, treeScale, targetMeshName).then(()=>{
                        campfireView.onComplete && campfireView.onComplete()
                        })
                    
                }
                else{
                    unfocusFromConstellationCanvas(scene, camera, triggerEffect, onRender, treeScale, targetMeshName).then(()=>
                        campfireView.onComplete && campfireView.onComplete()
                    )
                }
                
            }
            else {
                if(campfireView.immediate){
                    initializeLookingAtSky(scene, camera, treeScale).then(()=>{

                        console.log("INITIALIZING LOOKING AT SKY")
                        campfireView.onComplete && campfireView.onComplete()
                    })
                }
                else{
                    focusWithoutMovingToConstellationCanvas(scene, camera, triggerEffect, treeScale).then(()=>
                        campfireView.onComplete && campfireView.onComplete()
                    )
                }   
            }
        }
    }, [sceneLoaded, campfireView])

    return null
}