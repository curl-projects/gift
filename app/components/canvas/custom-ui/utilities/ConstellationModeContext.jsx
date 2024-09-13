import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the context
const ConstellationModeContext = createContext();

// Create a provider component
export const ConstellationModeProvider = ({ children }) => {
    const [drifting, setDrifting] = useState(false);
    const [expandedShapeIds, setExpandedShapeIds] = useState([]);
    const [narratorEvent, setNarratorEvent] = useState(null);
    
    const [starControls, _setStarControls] = useState({ visible: true, immediate: true });
    const [cloudControls, _setCloudControls] = useState({ visible: true, immediate: true });
    const [overlayControls, _setOverlayControls] = useState({ dark: false, immediate: true, duration: 2, }); // Consolidated state

    const setStarControls = (controls) => {
        return new Promise((resolve) => {
            _setStarControls({
                ...controls,
                onComplete: () => {
                    resolve();
                }
            });
        });
    }

    const setCloudControls = (controls) => {
        return new Promise((resolve) => {
            _setCloudControls({
                ...controls,
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

    return (
        <ConstellationModeContext.Provider 
            value={{ 
                drifting, setDrifting, 
                expandedShapeIds, setExpandedShapeIds, 
                narratorEvent, setNarratorEvent, 
                starControls, setStarControls,
                cloudControls, setCloudControls,
                overlayControls, setOverlayControls // Provide the consolidated state
            }}>
            {children}
        </ConstellationModeContext.Provider>
    );
};

// Custom hook to use the ConstellationModeContext
export const useConstellationMode = () => {
    return useContext(ConstellationModeContext);
};