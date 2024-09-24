import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the context
const ConstellationModeContext = createContext();

// Create a provider component
export const ConstellationModeProvider = ({ children }) => {
    
    const [expandedShapeIds, setExpandedShapeIds] = useState([]);
    
    

    const [constellationLabel, _setConstellationLabel] = useState({ visible: false, immediate: true });
    
    const [expandConcepts, _setExpandConcepts] = useState({ expanded: false });
    const [expandExcerpts, _setExpandExcerpts] = useState({ expanded: false });
    const [expandConstellation, _setExpandConstellation] = useState({ concepts: false, excerpts: false});


    const useStateWithPromise = (setter) => (value) => {
        return new Promise((resolve) => {
            const newValue = {
                ...value,
                onComplete: () => {
                    console.log(value, "COMPLETE")
                    resolve();
                }
            };
            setter(newValue); // Immediately call the setter with the new state
        });
    };


    const setConstellationLabel = useStateWithPromise(_setConstellationLabel);


    // SHAPE MANIPULATION
    const setExpandConstellation = useStateWithPromise(_setExpandConstellation);

    const setExpandConcepts = useStateWithPromise(_setExpandConcepts);
    const setExpandExcerpts = useStateWithPromise(_setExpandExcerpts);

    return (
        <ConstellationModeContext.Provider 
            value={{ 
                expandedShapeIds, setExpandedShapeIds, 
                expandConcepts, setExpandConcepts,
                expandExcerpts, setExpandExcerpts,
                expandConstellation, setExpandConstellation,
                constellationLabel, setConstellationLabel

            }}>
            {children}
        </ConstellationModeContext.Provider>
    );
};

// Custom hook to use the ConstellationModeContext
export const useConstellationMode = () => {
    return useContext(ConstellationModeContext);
};