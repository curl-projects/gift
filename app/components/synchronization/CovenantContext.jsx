import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDataContext } from './DataContext';
import { useStarFireSync } from '~/components/synchronization/StarFireSync'

const CovenantContext = createContext();

export const useCovenantContext = () => {
    return useContext(CovenantContext);
};


export const mainClauseMapping = {
    "CONNECT_TO_OWN_WORK": "idea",
    "CONNECT_TO_FOUND_ITEM": "idea",
    "CONNECT_TO_INTERESTING_PERSON": "idea",
    "ATTACH_NOVEL_THOUGHT": "novel thought"
}

export const modifierMapping = {
    "JUSTIFY": "justify",
    "FEWER_WORDS": "fewer words",
    "MORE_WORDS": "more words",
}

export const mainClauseTooltips = {
    "CONNECT_TO_OWN_WORK": "Connect to your own work",
    "CONNECT_TO_FOUND_ITEM": "Connect to your found items",
    "CONNECT_TO_INTERESTING_PERSON": "Connect to interesting people",
    "ATTACH_NOVEL_THOUGHT": "Attach a new thought"
}

export const CovenantProvider = ({ children }) => {
    const [covenantCompletion, setCovenantCompletion] = useState(null);
    const [annotationsExpanded, setAnnotationsExpanded] = useState(false);
    const [completedCovenants, setCompletedCovenants] = useState(0)
    const [totalCovenants, setTotalCovenants] = useState(0)
    const [selectedText, setSelectedText] = useState({ value: null })
    const [allCompleted, setAllCompleted] = useState(false)
    const { setGlyphControls, setTextEvent, focusOnComponent, setJournalMode } = useStarFireSync()

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
        if(!covenantCompletion){
            return 0
        }
        if(type === "mainClause"){
            const covenant = covenantCompletion.find(covenant => covenant.id === id)
            if(!covenant){
                console.error("NO COVENANT FOUND", covenant, type, id, covenantCompletion)
                return 0
            }
            return covenant.completionPercentage
        } else if (type === "modifier"){
            const modifier = covenantCompletion.flatMap(covenant => covenant.modifiers).find(modifier => modifier.id === id);
            if(!modifier){
                console.error("NO MODIFIER FOUND", modifier, type, id, covenantCompletion)
                return 0
            }
            return modifier.completionPercentage
        }
        else{
            console.log("NO CARD FOUND", type, id)
        }
    }

    useEffect(()=>{
        if(covenantCompletion){
            const allCovenantsCompleted = covenantCompletion.every(covenant => covenant.completionPercentage === 100);
            const allModifiersCompleted = covenantCompletion.every(covenant => 
                covenant.modifiers.every(modifier => modifier.completionPercentage === 100)
            );

            if(allCovenantsCompleted && allModifiersCompleted){
                setAllCompleted(true)
            } else {
                setAllCompleted(false)
            }

            console.log("FOCUS ON COMPONENT:", focusOnComponent.active, focusOnComponent)
    
            if (allCovenantsCompleted && allModifiersCompleted && !focusOnComponent.active
                ) {
                // close the journal
                console.log("TRIGGERING JOURNAL CLOSE EFFECT")
                setJournalMode({ active: false }).then(()=>{
                    setGlyphControls({ visible: true, immediate: false, duration: 4 })
                    setTextEvent({
                        type: "narrator",
                        visible: true,
                        overlay: false,
                        text: "Covenants completed",
                        requiresInteraction: false,
                        darkeningVisible: true,
                        duration: 4000,
                    }).then(()=>{
                        setTimeout(()=>{
                            setTextEvent({
                                type: "narrator",
                                visible: false,
                                overlay: false,
                            })
                        }, 3000)
                    })   
                })

        
        }
        } else {
            console.log("Some covenants or modifiers are not completed.");
        }
    }, [covenantCompletion, focusOnComponent])

    function calculateActiveChars(type, mappingType, completionPercentage){

        const text = type === "mainClause" ? mainClauseMapping[mappingType] : modifierMapping[mappingType]
        const activeCharsCount = Math.ceil((completionPercentage / 100) * text.length);
        return activeCharsCount
    }

    function findCovenantForModifier(modifierId){
        return covenantCompletion.find(covenant => covenant.modifiers.find(modifier => modifier.id === modifierId))
    }

    return (
        <CovenantContext.Provider 
            value={{
                covenantCompletion, setCovenantCompletion, 
                annotationsExpanded, setAnnotationsExpanded,
                completedCovenants, totalCovenants,
                calculateCompletionPercentage, calculateActiveChars, findCovenantForModifier,
                selectedText, setSelectedText, allCompleted, setAllCompleted
            }}>
            {children}
        </CovenantContext.Provider>
    );
};