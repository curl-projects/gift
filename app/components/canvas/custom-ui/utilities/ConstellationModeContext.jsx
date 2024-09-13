import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the context
const ConstellationModeContext = createContext();

// Create a provider component
export const ConstellationModeProvider = ({ children }) => {
    const [drifting, setDrifting] = useState(false);
    const [expandedShapeIds, setExpandedShapeIds] = useState([]);
    const [narratorEvent, setNarratorEvent] = useState(null);
    
    const [starControls, _setStarControls] = useState({ visible: false, immediate: true });
    const [cloudControls, _setCloudControls] = useState({ visible: false, immediate: true });
    const [expandConstellation, _setExpandConstellation] = useState({ concepts: false, excerpts: false });


    const useStateWithPromise = (setter) => (value) => {
        return new Promise((resolve) => {
            const newValue = {
                ...value,
                onComplete: () => {
                    resolve();
                }
            };
            setter(newValue); // Immediately call the setter with the new state
        });
    };

    const setExpandConstellation = useStateWithPromise(_setExpandConstellation);
    const setStarControls = useStateWithPromise(_setStarControls);
    const setCloudControls = useStateWithPromise(_setCloudControls);

    return (
        <ConstellationModeContext.Provider 
            value={{ 
                drifting, setDrifting, 
                expandedShapeIds, setExpandedShapeIds, 
                narratorEvent, setNarratorEvent, 
                starControls, setStarControls,
                cloudControls, setCloudControls,
                expandConstellation, setExpandConstellation,
            }}>
            {children}
        </ConstellationModeContext.Provider>
    );
};

// Custom hook to use the ConstellationModeContext
export const useConstellationMode = () => {
    return useContext(ConstellationModeContext);
};