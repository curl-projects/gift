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
import { GoalProvider } from '~/components/synchronization/GoalContext';

export async function loader() {
    return null;
  }

// prevent remix based revalidation
export function shouldRevalidate(){
    return false;
}

export default function PitchDeck(){

    const { campfireView, enableFire, setEnableFire, userInfo, setUserInfo } = useStarFireSync();

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
        console.log("USER INFO:", userInfo)
    }, [userInfo])

    const { data: userData, isLoading: userDataLoading, isSuccess: userDataSuccess } = useQuery({
        queryKey: ['userData', userInfo],
        queryFn: async () => {
            console.log("FETCHING USER DATA:", userInfo)
            if(!userInfo) return null;
            const response = await fetch(`/user/${userInfo.uniqueName}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        },
        enabled: !!userInfo,
    })


    useEffect(() => {
        console.log("NEW DATA:", newData)
        if(newData){
            setData(newData);
        }
    }, [newData])


    useEffect(() => {
        console.log("USER DATA:", userData)
    }, [userData])

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
                <DataProvider value={{data, isLoading, isSuccess, userData, userDataLoading, userDataSuccess}}>
                    <GoalProvider>
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
                            willChange: 'transform',
                            pointerEvents: campfireView?.active ? 'unset' : 'none',
                            }}>
                                {/* <PitchScene/> */}
                            </div>  
                        </CovenantProvider> 
                    </GoalProvider>
                </DataProvider>
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