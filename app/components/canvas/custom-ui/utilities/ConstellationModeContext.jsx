import React, { createContext, useState, useContext } from 'react';

// Create the context
const ConstellationModeContext = createContext();

// Create a provider component
export const ConstellationModeProvider = ({ children }) => {
    const [drifting, setDrifting] = useState(false);
    const [expandedShapeIds, setExpandedShapeIds] = useState([])
    const [narratorEvent, setNarratorEvent] = useState(null)
    const [overlayMode, setOverlayMode] = useState(false);

    return (
        <ConstellationModeContext.Provider 
            value={{ 
                drifting, setDrifting, 
                expandedShapeIds, setExpandedShapeIds, 
                narratorEvent, setNarratorEvent, 
                overlayMode, setOverlayMode
            }}>
            {children}
        </ConstellationModeContext.Provider>
    );
};

// Custom hook to use the ConstellationModeContext
export const useConstellationMode = () => {
    return useContext(ConstellationModeContext);
};