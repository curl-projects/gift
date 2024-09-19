import React, { createContext, useContext, useState, useCallback } from 'react';

const StarFireSyncContext = createContext();

const StarFireSyncProvider = ({ children }) => {
    const [activeEffect, setActiveEffect] = useState(null);
    const [triggerWarp, _setTriggerWarp] = useState({active: false, accDuration: 500, deaccDuration: 500, constAccDuration: 500});
    const [restored, setRestored] = useState(false);
    const [campfireView, _setCampfireView] = useState(null);
    const [sceneLoaded, setSceneLoaded] = useState(false);
    const [commandEvent, _setCommandEvent] = useState(null);
    const [animationEvent, _setAnimationEvent] = useState(null);

    const [cloudControls, _setCloudControls] = useState({ visible: true, immediate: true });
    const [starControls, _setStarControls] = useState({ visible: true, immediate: true });
    const [glyphControls, _setGlyphControls] = useState({ visible: false, immediate: false });
    const [titleControls, _setTitleControls] = useState({ visible: false, immediate: false });

    // TEXT STUFF
    const [textEvent, _setTextEvent] = useState(null);
    const [gameSystemText, _setGameSystemText] = useState({ visible: false, text: '', requiresInteraction: false });
    const [gameNarratorText, _setGameNarratorText] = useState({ visible: false, text: '', requiresInteraction: false });
    const [narratorText, _setNarratorText] = useState({ visible: false, text: '', requiresInteraction: false });
    const [systemText, _setSystemText] = useState({ visible: false, text: '', requiresInteraction: false });

    const [constellationLabel, _setConstellationLabel] = useState({ visible: false, immediate: true });


    const [overlayControls, _setOverlayControls] = useState({ dark: false, immediate: true, duration: 2, }); // Consolidated state
    
    // set this true initially to cover everything
    const [trueOverlayControls, _setTrueOverlayControls] = useState({ visible: false, immediate: true, duration: 2, }); // Consolidated state


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

    // TEXT STUFF
    const setTextEvent = useStateWithPromise(_setTextEvent);
    const setNarratorText = useStateWithPromise(_setNarratorText);
    const setSystemText = useStateWithPromise(_setSystemText);
    const setGameNarratorText = useStateWithPromise(_setGameNarratorText);
    const setGameSystemText = useStateWithPromise(_setGameSystemText);

    const setConstellationLabel = useStateWithPromise(_setConstellationLabel);

    // AESTHETICS
    const setCloudControls = useStateWithPromise(_setCloudControls);
    const setStarControls = useStateWithPromise(_setStarControls);
    const setGlyphControls = useStateWithPromise(_setGlyphControls);
    const setTitleControls = useStateWithPromise(_setTitleControls);

    const setTriggerWarp = useStateWithPromise(_setTriggerWarp);
    const setCampfireView = useStateWithPromise(_setCampfireView);
    const setOverlayControls = useStateWithPromise(_setOverlayControls);
    const setTrueOverlayControls = useStateWithPromise(_setTrueOverlayControls);
    const setCommandEvent = useStateWithPromise(_setCommandEvent);
    const setAnimationEvent = useStateWithPromise(_setAnimationEvent);
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
                animationEvent, setAnimationEvent,
                journalMode, setJournalMode,


                textEvent, setTextEvent,
                gameSystemText, setGameSystemText,
                gameNarratorText, setGameNarratorText,
                narratorText, setNarratorText,
                systemText, setSystemText,

                constellationLabel, setConstellationLabel,

                cloudControls, setCloudControls,
                starControls, setStarControls,
                glyphControls, setGlyphControls,
                titleControls, setTitleControls,
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
