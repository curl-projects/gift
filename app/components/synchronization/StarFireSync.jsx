import React, { createContext, useContext, useState, useCallback } from 'react';

const StarFireSyncContext = createContext();

const StarFireSyncProvider = ({ children }) => {
    const [activeEffect, setActiveEffect] = useState(null);
    const [triggerWarp, _setTriggerWarp] = useState({active: false, accDuration: 500, deaccDuration: 500, constAccDuration: 500});
    const [restored, setRestored] = useState(false);
    const [campfireView, _setCampfireView] = useState(null);
    const [sceneLoaded, setSceneLoaded] = useState(false);
    const [commandEvent, _setCommandEvent] = useState(null);


    const [textEvent, setTextEvent] = useState(null);

    const [overlayControls, _setOverlayControls] = useState({ dark: false, immediate: true, duration: 2, }); // Consolidated state
    const [trueOverlayControls, _setTrueOverlayControls] = useState({ visible: false, immediate: true, duration: 2, }); // Consolidated state

    const [gameSystemText, _setGameSystemText] = useState({ visible: false, text: '', requiresInteraction: false });
    const [gameNarratorText, _setGameNarratorText] = useState({ visible: false, text: '', requiresInteraction: false });

    const [journalMode, _setJournalMode] = useState({ active: false, page: ""});

    const useStateWithPromise = (setter) => (value) => {
        return new Promise((resolve) => {
            setter({
                ...value,
                onComplete: () => {
                    resolve();
                }
            });
        });
    };

    const setTriggerWarp = useStateWithPromise(_setTriggerWarp);
    const setGameNarratorText = useStateWithPromise(_setGameNarratorText);
    const setGameSystemText = useStateWithPromise(_setGameSystemText);
    const setCampfireView = useStateWithPromise(_setCampfireView);
    const setOverlayControls = useStateWithPromise(_setOverlayControls);
    const setTrueOverlayControls = useStateWithPromise(_setTrueOverlayControls);
    const setCommandEvent = useStateWithPromise(_setCommandEvent);
    const setJournalMode = useStateWithPromise(_setJournalMode);

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
                commandEvent, setCommandEvent,
                gameSystemText, setGameSystemText,
                gameNarratorText, setGameNarratorText,
                journalMode, setJournalMode,
                textEvent, setTextEvent,

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
