import React, { createContext, useContext, useState, useCallback } from 'react';

const StarFireSyncContext = createContext();

const StarFireSyncProvider = ({ children }) => {
    const [activeEffect, setActiveEffect] = useState(null);
    const [triggerWarp, setTriggerWarp] = useState({active: false, accDuration: 500, deaccDuration: 500, constAccDuration: 500});
    const [restored, setRestored] = useState(false);
    const [campfireView, _setCampfireView] = useState(null);
    const [sceneLoaded, setSceneLoaded] = useState(false);

    const [overlayControls, _setOverlayControls] = useState({ dark: false, immediate: true, duration: 2, }); // Consolidated state
    const [trueOverlayControls, _setTrueOverlayControls] = useState({ visible: false, immediate: true, duration: 2, }); // Consolidated state


    const setCampfireView = (view) => {
        return new Promise((resolve) => {
            _setCampfireView({
                ...view,
                onComplete: () => {
                    resolve();
                }
            });
        });
    }

    const setOverlayControls = (controls) => {
        return new Promise((resolve) => {
            _setOverlayControls({
                ...controls,
                onComplete: () => {
                    resolve();
                }
            });
        });
    }

    const setTrueOverlayControls = (controls) => {
        return new Promise((resolve) => {
            _setTrueOverlayControls({
                ...controls,
                onComplete: () => {
                    resolve();
                }
            });
        });
    }

    const triggerEffect = useCallback(({domain, selector, effect, callback}) => {
        console.log("HELLO")
        setActiveEffect({
            domain: domain,
            selector: selector,
            effect: effect,
            callback: callback,
            timestamp: Date.now()
        });
    }, []);

    return (
        <StarFireSyncContext.Provider 
            value={{ 
                triggerEffect, 
                activeEffect, 
                triggerWarp, 
                setTriggerWarp, 
                restored, 
                setRestored, 
                campfireView, 
                setCampfireView,
                sceneLoaded,
                setSceneLoaded,
                overlayControls, setOverlayControls,
                trueOverlayControls, setTrueOverlayControls,
            }}>
            {children}
        </StarFireSyncContext.Provider>
    );
};

export const StarFireSync = ({ children }) => {
    return (
        <StarFireSyncProvider>
            {children}
        </StarFireSyncProvider>
    );
};

export const useStarFireSync = () => {
    return useContext(StarFireSyncContext);
};
