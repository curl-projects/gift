import { useStarFireSync } from '~/components/synchronization/StarFireSync';
import { useEffect } from 'react';
import { focusWithoutMovingToConstellationCanvas, 
         unfocusFromConstellationCanvas,
         unfocusFromConstellationCanvasImmediately,
         initializeLookingAtSky,
        } from '~/components/environment/event-controllers/campfire-transition';
import { useParams } from "@remix-run/react";

export function CampfireSyncListener({ scene, onRender }){
    const { triggerEffect, activeEffect, setTriggerWarp, campfireView, setCampfireView, sceneLoaded } = useStarFireSync();
    const { person } = useParams();

    console.log("PERSON:", person)


    useEffect(() => {

        const camera = scene.getCameraByName("babylon-camera")
        
      
        if(sceneLoaded && campfireView){
            console.log("CAMPFIRE VIEW", campfireView)

            const treeScale = campfireView?.treeScale !== undefined ? campfireView.treeScale : true;
            const targetMeshName = campfireView?.targetMeshName !== undefined ? campfireView.targetMeshName : 'campfire';
            const targetPosition = campfireView?.targetPosition !== undefined ? campfireView.targetPosition : null;
            const useTargetPosition = campfireView?.useTargetPosition !== undefined ? campfireView.useTargetPosition : true;


            console.warn("TARGET POSITION:", targetPosition)
            console.warn("TARGET MESH NAME:", targetMeshName)
            console.warn("USE TARGET POSITION:", useTargetPosition)

            if(campfireView.active){
                if(campfireView.immediate){
                    unfocusFromConstellationCanvasImmediately(scene, camera, onRender, treeScale, targetMeshName, targetPosition, 0.8, useTargetPosition).then(()=>{
                        campfireView.onComplete && campfireView.onComplete()
                        })
                    
                }
                else{
                    console.log("UNFOCUSING FROM CANVAS PERSON:", person)
                    unfocusFromConstellationCanvas(scene, camera, triggerEffect, onRender,person, treeScale, targetMeshName, targetPosition, 0.8, useTargetPosition).then(()=>
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
                    focusWithoutMovingToConstellationCanvas(scene, camera, triggerEffect, person, treeScale).then(()=>
                        campfireView.onComplete && campfireView.onComplete()
                    )
                }   
            }
        }
    }, [sceneLoaded, campfireView])

    return null
}
