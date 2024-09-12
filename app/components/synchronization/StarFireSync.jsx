import React, { createContext, useContext, useState, useCallback } from 'react';

const StarFireSyncContext = createContext();

const StarFireSyncProvider = ({ children }) => {
    const [activeEffect, setActiveEffect] = useState(null);
    const [triggerWarp, setTriggerWarp] = useState({active: false, accDuration: 500, deaccDuration: 500, constAccDuration: 500});
    const [restored, setRestored] = useState(false);
    const [campfireView, setCampfireView] = useState(false);

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
                setCampfireView 
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
