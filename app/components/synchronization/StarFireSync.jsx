import React, { createContext, useContext, useState, useCallback } from 'react';

const StarFireSyncContext = createContext();

const StarFireSyncProvider = ({ children }) => {
    const [narratorEvent, setNarratorEvent] = useState(null);

    const [activeEffect, setActiveEffect] = useState(null);
    const [triggerWarp, _setTriggerWarp] = useState({active: false, accDuration: 500, deaccDuration: 500, constAccDuration: 500});
    const [restored, setRestored] = useState(false);
    const [campfireView, _setCampfireView] = useState({ active: false, immediate: true});
    const [sceneLoaded, setSceneLoaded] = useState(false);
    const [commandEvent, _setCommandEvent] = useState(null);
    const [animationEvent, _setAnimationEvent] = useState(null);

    const [portfolioControls, _setPortfolioControls] = useState({ visible: false });

    const [cloudControls, _setCloudControls] = useState({ visible: true, immediate: true });
    const [starControls, _setStarControls] = useState({ visible: true, immediate: true });
    const [glyphControls, _setGlyphControls] = useState({ visible: false, immediate: false });
    const [titleControls, _setTitleControls] = useState({ visible: false, immediate: false });
    const [toggleContact, _setToggleContact] = useState({visible: false});

    const [drifting, _setDrifting] = useState({ active: false });
    const [deleteStar, _setDeleteStar] = useState({ deleted: false, created: false});

    // TEXT STUFF
    const [textEvent, _setTextEvent] = useState(null);
    const [gameSystemText, _setGameSystemText] = useState({ visible: false, text: '', requiresInteraction: false });
    const [gameNarratorText, _setGameNarratorText] = useState({ visible: false, text: '', requiresInteraction: false });
    const [narratorText, _setNarratorText] = useState({ visible: false, text: '', requiresInteraction: false });
    const [systemText, _setSystemText] = useState({ visible: false, text: '', requiresInteraction: false });

    const [constellationLabel, _setConstellationLabel] = useState({ visible: false, immediate: true });
    const [journalZooms, setJournalZooms] = useState(false)
    const [focusOnComponent, setFocusOnComponent] = useState({ active: false, component: null, opacity: null})
    const [enableTLDrawZoom, setEnableTLDrawZoom] = useState(true);

    const [overlayControls, _setOverlayControls] = useState({ startColor: '#1E4D60', endColor: '#101C3E', immediate: true, duration: 2, delay: 0 }); // Consolidated state;
    const [cloudDarkeningControls, _setCloudDarkeningControls] = useState({ visible: false, colors: [] });
    
    // set this true initially to cover everything
    const [trueOverlayControls, _setTrueOverlayControls] = useState({ visible: true, immediate: true }); // Consolidated state

    const [journalMode, _setJournalMode] = useState({ active: false, page: "article"});

    const [minimapMode, setMinimapMode] = useState({ active: true, expandedScale: 3, hoveredScale: 2, dragScale: 1.4, expanded: false});

    const [enableFire, setEnableFire] = useState(true);

    const [campfireDialogue, setCampfireDialogue] = useState({ active: false });

    const [conceptList, setConceptList] = useState({active: false, focusedConcept: null })
    const [conceptIsDragging, setConceptIsDragging] = useState({active: false, id: null})

    const [userInfo, setUserInfo] = useState({
        uniqueName: 'andre-vacha',
    })

    const [entries, setEntries] = useState({values: [
        {
            id: "1",
            type: 'concept',
            title: "Immersive Storytelling",
            content: "Software, to be transformative, must manifest the emotive tools of game design.",
            author: "Andre Vacha",
            date: "2024-02-20"
        },
        {
            id: "2",
            type: "article",
            title: "Game Design in Software v2",
            content: "...we must move beyond the current paradigm of software...",
            author: "Finn Macken",
            date: "2024-03-05",
            html: "<h1>Hello</h1><p>My name is Finn"
        },
        {
            id: "3",
            type: 'concept',
            title: "Immersive Storytelling",
            content: "Software, to be transformative, must manifest the emotive tools of game design.",
            author: "Andre Vacha",
            date: "2024-02-20"
        },
    ],
    prevValues: []
})

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

    const setDeleteStar = useStateWithPromise(_setDeleteStar);
    const setTriggerWarp = useStateWithPromise(_setTriggerWarp);
    const setCampfireView = useStateWithPromise(_setCampfireView);
    const setOverlayControls = useStateWithPromise(_setOverlayControls);
    const setTrueOverlayControls = useStateWithPromise(_setTrueOverlayControls);
    const setCommandEvent = useStateWithPromise(_setCommandEvent);
    const setAnimationEvent = useStateWithPromise(_setAnimationEvent);
    const setJournalMode = useStateWithPromise(_setJournalMode);
    const setDrifting = useStateWithPromise(_setDrifting);
    const setToggleContact = useStateWithPromise(_setToggleContact);
    const setCloudDarkeningControls = useStateWithPromise(_setCloudDarkeningControls);
    const setPortfolioControls = useStateWithPromise(_setPortfolioControls);


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
                narratorEvent, setNarratorEvent,
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
                drifting, setDrifting,

                portfolioControls, setPortfolioControls,

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
                deleteStar, setDeleteStar,
                toggleContact, setToggleContact,
                minimapMode, setMinimapMode,
                cloudDarkeningControls, setCloudDarkeningControls,
                journalZooms, setJournalZooms,
                enableTLDrawZoom, setEnableTLDrawZoom,
                focusOnComponent, setFocusOnComponent,
                enableFire, setEnableFire,
                campfireDialogue, setCampfireDialogue,
                entries, setEntries,
                conceptList, setConceptList,
                conceptIsDragging, setConceptIsDragging,
                userInfo, setUserInfo,
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
