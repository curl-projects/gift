import { PitchScene } from "~/components/environment/PitchScene/PitchScene";
import WorldCanvas from "~/components/canvas/WorldCanvas";
// import { getWorldContent, getJournalEntries } from "~/models/world-model.server";
// import { json } from "@remix-run/node";
import { useState, useEffect } from "react";
import { useStarFireSync } from "~/components/synchronization/StarFireSync";
import { OverlayPainter } from "~/components/synchronization/sync-ui/OverlayPainter";
import { isBrowser, isMobile, isTablet } from 'react-device-detect';
import { MobileStarlight } from "~/components/misc/MobileStarlight"
import { BrowserWarning } from "~/components/synchronization/browser-sync/BrowserWarning"
import { DisclaimerPainter } from "~/components/canvas/custom-ui/utilities/DisclaimerPainter"
import { useQuery } from '@tanstack/react-query';
import { useParams } from '@remix-run/react';
import { DataProvider } from '~/components/synchronization/DataContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CovenantProvider } from '~/components/synchronization/CovenantContext';

export async function loader() {
    return null;
  }


// prevent remix based revalidation
export function shouldRevalidate(){
    return false;
}

export default function PitchDeck(){

    const { campfireView } = useStarFireSync();

    const { person } = useParams();
    const [data, setData] = useState(null);

    useEffect(() => {
        console.log("PERSON:", person)
    }, [person])

    const { data: newData, isLoading, isSuccess, error } = useQuery({
        queryKey: ['worldContent', person],
        queryFn: async () => {
            const response = await fetch(`/data/${person}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        },
        enabled: !!person,
    });


    useEffect(() => {
        console.log("NEW DATA:", newData)
        if(newData){
            setData(newData);
        }
    }, [newData])

    useEffect(()=>{
        console.log("IS LOADING:", isLoading)
    }, [isLoading])

    useEffect(() => {
        console.log("ERROR:", error)
    }, [error])

    if(data){
        if(isMobile){
            return(
                <MobileStarlight />
            )
        }
        else if(isBrowser || isTablet){
            return(
                <>
                <DataProvider value={{data, isLoading, isSuccess}}>
                    <CovenantProvider>
                        <DisclaimerPainter />
                        <BrowserWarning />
                        <OverlayPainter />
                        <div id='constellation-canvas' style={{
                        height: '100vh',
                        width: '100vw',
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        zIndex: 0,
                        overflow: 'hidden',
                        }}>
                            <WorldCanvas />
                        </div>
                        <div 
                        style={{
                        height: '100vh',
                        width: '100vw',
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        zIndex: 0,
                        overflow: 'hidden',
                        pointerEvents: campfireView?.active ? 'unset' : 'none',
                        }}>
                            <PitchScene/>
                        </div>  
                    </CovenantProvider> 
                </DataProvider>     
                </>
            )
        }
        else return null;
    }
    else{
        return  <div style={{
            backgroundColor: 'black',
            height: '100vh',
            width: '100vw',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 0,
        }}></div>
    }
  
}