import { createContext, useContext, useState, useEffect } from 'react';
import { useCovenantContext } from "~/components/synchronization/CovenantContext"

// Create a context for card state
const CardStateContext = createContext();

// Create a provider component for card state
export function CardStateProvider({ children, cardType, cardId, card }) {
    const { covenantCompletion, setCovenantCompletion, selectedText: globalSelectedText, findCovenantForModifier } = useCovenantContext();
    const [cardState, setCardState] = useState({state: "neutral", expandable: false });
    const [cardClicked, setCardClicked] = useState(false);

    // sync updates -- handled by third party components
    const [selectedText, _setSelectedText] = useState({ value: null });
    const [connectedItem, _setConnectedItem] = useState({ value: null });
    const [content, _setContent] = useState({ value: null });

    // don't sync updates -- handled within the component
    const [completionPercentage, setCompletionPercentage] = useState(0);
    const [activeCharsCount, setActiveCharsCount] = useState(0);

    // update covenantCompletion in response to events occurring
    function updateCovenantState(key, value){
        console.log("UPDATING COVENANT STATE", key, value)
        if(cardType === 'mainClause'){
            const covenant = covenantCompletion.find(covenant => covenant.id === cardId)
            const newCovenant = {
                ...covenant,
                [key]: value
            }
            const newCovenantCompletion = covenantCompletion.map(covenant => covenant.id === cardId ? newCovenant : covenant)
            console.log("NEW COVENANT COMPLETION", newCovenantCompletion, "UPDATED:", key, value)
            setCovenantCompletion(newCovenantCompletion)
        }
        else if(cardType === 'modifier'){
            const newCovenantCompletion = covenantCompletion.map(covenant => {
                const modifierIndex = covenant.modifiers.findIndex(modifier => modifier.id === cardId);
                if(modifierIndex !== -1){
                    const newModifiers = [...covenant.modifiers];
                    newModifiers[modifierIndex] = {
                        ...newModifiers[modifierIndex],
                        [key]: value
                    };
                    return {
                        ...covenant,
                        modifiers: newModifiers
                    };
                } else {
                    return covenant;
                }
            });
            console.log("NEW MODIFIER COVENANT COMPLETION", newCovenantCompletion, "UPDATED:", key, value)
            setCovenantCompletion(newCovenantCompletion)
        }
    }

    const createSetterWrapper = (setter, key) => (value) => {
        setter(value);
        updateCovenantState(key, value);
    };

    const setSelectedText = createSetterWrapper(_setSelectedText, 'selectedText');
    const setConnectedItem = createSetterWrapper(_setConnectedItem, 'connectedItem');
    const setContent = createSetterWrapper(_setContent, 'content');

    // whenever the covenant completion changes, update the completion percentage for the card
    useEffect(()=>{
        if(cardType === 'mainClause'){
            setCompletionPercentage(covenantCompletion.find(covenant => covenant.id === cardId).completionPercentage)
        }
        else if(cardType === 'modifier'){
            setCompletionPercentage(covenantCompletion.flatMap(covenant => covenant.modifiers).find(modifier => modifier.id === cardId).completionPercentage)
        }
        else{
            console.error("CARD TYPE NOT FOUND", cardType)
        }
    }, [covenantCompletion])

    // update card rendering whenever covenantCompletion changes -- there can't be any covenantState dependings in here
    useEffect(()=>{
        console.log("SELECTED TEXT", selectedText)
        console.log("CONNECTED ITEM", connectedItem)
        if(cardType === 'mainClause'){
            // card update variants go here
            if(card.covenantType === "CONNECT_TO_OWN_WORK"){

                console.log("CONNECT TO OWN WORK")
                if(!selectedText.value?.textContent && !connectedItem.value){
                    setCardState({state: "neutral", expandable: false})
                    updateCovenantState("completionPercentage", 0)
                }
                else if(selectedText.value?.textContent && !connectedItem.value){
                    setCardState({state: "inProgress", expandable: true})
                    updateCovenantState("completionPercentage", 50)
                }
                else if(!selectedText.value?.textContent && connectedItem.value){
                    setCardState({state: "inProgress", expandable: true})
                    updateCovenantState("completionPercentage", 50)
                }
                else if(selectedText.value?.textContent && connectedItem.value){
                    setCardState({state: "complete", expandable: true})
                    updateCovenantState("completionPercentage", 100)
                }
            }
        }
        else if(cardType === 'modifier'){
            if(card.modifier === "JUSTIFY"){
                const maxCharacters = 100;
                const completionPercentage = Math.min(((content.value?.length || 0) / maxCharacters) * 100, 100);
                console.log("JUSTIFY COMPLETION PERCENTAGE", completionPercentage)
                updateCovenantState("completionPercentage", completionPercentage);
            }
        }
    }, [selectedText, connectedItem, content])

    useEffect(() => {
        if (cardType === 'modifier') {
            const covenant = findCovenantForModifier(cardId)
    
            // Check if the main covenant is complete and disable the modifier if not
            console.log("MODIFIER COVENANT", covenant)
            if (covenant.completionPercentage < 100) {
                setCardState({ state: "disabled", expandable: true })
            } else {
                setCardState({ state: "inProgress", expandable: true })
            }
        }
    }, [covenantCompletion])

    // logic for updating the card's selected text
    useEffect(()=>{
        console.log("GLOBAL SELECTED TEXT", globalSelectedText)
        if(globalSelectedText.value?.textContent 
            && cardType === 'mainClause'
            && card.covenantType === "CONNECT_TO_OWN_WORK"
            && connectedItem.value === null // only update if we haven't already set a new item
        ){
            setSelectedText({value: globalSelectedText.value})
        }
    }, [globalSelectedText])

    // calculate active chars
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

    useEffect(()=>{
        const text = cardType === 'mainClause' ? mainClauseMapping[card.covenantType] : modifierMapping[card.modifier]
        const activeCharsCount = Math.ceil((completionPercentage / 100) * text.length);
        setActiveCharsCount(activeCharsCount)
    }, [completionPercentage])
       
    return (
        <CardStateContext.Provider 
            value={{ cardState, setCardState, 
                     cardClicked, setCardClicked, 
                     selectedText, setSelectedText, 
                     connectedItem, setConnectedItem,
                     content, setContent,
                     completionPercentage, activeCharsCount,
                     }}>
            {children}
        </CardStateContext.Provider>
    );
}

// Create a custom hook to use the CardStateContext
export function useCardState() {
    const context = useContext(CardStateContext);
    if (!context) {
        throw new Error('useCardState must be used within a CardStateProvider');
    }
    return context;
}