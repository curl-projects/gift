import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDataContext } from './DataContext';
const CovenantContext = createContext();

export const useCovenantContext = () => {
    return useContext(CovenantContext);
};

export const CovenantProvider = ({ children }) => {
    const [covenantCompletion, setCovenantCompletion] = useState(null);
    const [annotationsExpanded, setAnnotationsExpanded] = useState(false);
    const [completedCovenants, setCompletedCovenants] = useState(0)
    const [totalCovenants, setTotalCovenants] = useState(0)
    const [selectedText, setSelectedText] = useState({ value: null })

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
        setTotalCovenants(covenants.length)
    }, [data])

    useEffect(()=>{
        if(covenantCompletion){
            const completedCovenants = covenantCompletion.filter(covenant => covenant.completionPercentage === 100)
            setCompletedCovenants(completedCovenants.length)
        }
    }, [covenantCompletion])

    function calculateCompletionPercentage(type, id){
        const card = covenantCompletion.find(covenant => covenant.id === id)
        if(card && type === "mainClause"){
            return card.completionPercentage
        } else if (card && type === "modifier"){
            return card.modifiers.find(modifier => modifier.id === id).completionPercentage
        }
        else{
            console.log("NO CARD FOUND", card)
        }
    }

    function calculateActiveChars(type, mappingType, completionPercentage){
        const mainClauseMapping = {
            "CONNECT_TO_OWN_WORK": "idea",
            "CONNECT_TO_FOUND_ITEM": "item",
            "CONNECT_TO_INTERESTING_PERSON": "person",
            "ATTACH_NOVEL_THOUGHT": "thought"
        }
    
        const modifierMapping = {
            "JUSTIFY": "justify",
            "FEWER_WORDS": "fewer words",
            "MORE_WORDS": "more words",
        }

        const text = type === "mainClause" ? mainClauseMapping[mappingType] : modifierMapping[mappingType]
        const activeCharsCount = Math.ceil((completionPercentage / 100) * text.length);
        return activeCharsCount
    }

    return (
        <CovenantContext.Provider 
            value={{
                covenantCompletion, setCovenantCompletion, 
                annotationsExpanded, setAnnotationsExpanded,
                completedCovenants, totalCovenants,
                calculateCompletionPercentage, calculateActiveChars,
                selectedText, setSelectedText,
            }}>
            {children}
        </CovenantContext.Provider>
    );
};