import React, { createContext, useState, useContext } from 'react';

// Create the context
const ConstellationModeContext = createContext();

// Create a provider component
export const ConstellationModeProvider = ({ children }) => {
    const [drifting, setDrifting] = useState(false);
    const [isClicked, setIsClicked] = useState(false);

    return (
        <ConstellationModeContext.Provider value={{ drifting, setDrifting, isClicked, setIsClicked }}>
            {children}
        </ConstellationModeContext.Provider>
    );
};

// Custom hook to use the ConstellationModeContext
export const useConstellationMode = () => {
    return useContext(ConstellationModeContext);
};