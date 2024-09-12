import { useStarFireSync } from '~/components/synchronization/StarFireSync';
import { useEffect } from 'react';
import { focusWithoutMovingToConstellationCanvas, giveControlToCanvas } from '~/components/environment/helpers/gui';

export function CampfireSyncListener({ scene }){
    const { triggerEffect, activeEffect, setTriggerWarp, campfireView, setCampfireView } = useStarFireSync();

    useEffect(() => {
        if(!campfireView){
            // trigger campfire view
            focusWithoutMovingToConstellationCanvas(scene, camera, triggerEffect, setTriggerWarp).then(() => {
                giveControlToCanvas()
                setCampfireView(true)
            })

        }
    }, [campfireView])

    return null
}