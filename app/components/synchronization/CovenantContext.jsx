import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDataContext } from './DataContext';
const CovenantContext = createContext();

export const useCovenantContext = () => {
    return useContext(CovenantContext);
};

export const CovenantProvider = ({ children }) => {
    const [covenantCompletion, setCovenantCompletion] = useState(null);
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [annotationsExpanded, setAnnotationsExpanded] = useState(false);

    const isAnyExpanded = expandedIndex !== null;
    const { data } = useDataContext();

    useEffect(()=>{
        const covenants = data.user.covenants.map(covenant => {
            return {
                id: covenant.id,
                covenantType: covenant.covenantType,
                completionPercentage: 0,
                modifiers: covenant.modifiers.filter(modifier => {
                    return {
                        id: modifier.id,
                        modifier: modifier.modifier,
                        completionPercentage: 0,
                    }
                })
            }
        })
        setCovenantCompletion(covenants)
    }, [data])

    return (
        <CovenantContext.Provider 
            value={{
                covenantCompletion, setCovenantCompletion, 
                expandedIndex, setExpandedIndex, 
                isAnyExpanded,
                annotationsExpanded, setAnnotationsExpanded
            }}>
            {children}
        </CovenantContext.Provider>
    );
};