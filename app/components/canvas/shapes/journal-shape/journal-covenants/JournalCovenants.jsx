import styles from './JournalCovenants.module.css';
import labelStyles from '~/components/canvas/custom-ui/utilities/ConstellationLabelPainter.module.css';
import { motion, useAnimation, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useSprings, animated, to as interpolate, useSpring } from '@react-spring/web'
import { useDrag } from 'react-use-gesture'
import { useState, useEffect, useRef } from 'react';
import { Covenant, CovenantMainClause, CovenantConjunction, CovenantClause } from "~/components/canvas/custom-ui/utilities/ConstellationLabelPainter.jsx"
import { useDataContext } from "~/components/synchronization/DataContext"
import { englishToLepchaMap } from "~/components/canvas/helpers/language-funcs.js"

import { ConnectCard } from './clause-cards/ConnectCard.jsx'
import { JustifyCard } from './clause-cards/JustifyCard.jsx'
import { useCovenantContext } from "~/components/synchronization/CovenantContext"
import { useStarFireSync } from '~/components/synchronization/StarFireSync'
import useMeasure from 'react-use-measure';


export function JournalCovenants({ shape, selectionFragment, journalCovenantsRef, annotationsExpanded }) {
    const { data } = useDataContext();
    const [activeCovenant, setActiveCovenant] = useState(data.user.covenants[0]);
    const [currentCount, setCurrentCount] = useState(activeCovenant.times);
    const { expandedIndex, setExpandedIndex, isAnyExpanded } = useCovenantContext();
  
    const { flex } = useSpring({
      flex: annotationsExpanded ? 6 : 0.5,
      config: { tension: 100, friction: 15 }
  });
  
    return (
      <animated.div 
          className={styles.journalCovenants}
          style={{
              flex: 0.5,
          }}
          ref={journalCovenantsRef}
          
          >
          <div className={styles.container}>
            <div className={styles.journalCovenantSwitcher}>
            {data.user.covenants.map((covenant, index) => (
                <div key={index} className={styles.covenantSwitcherItem} onClick={() => setActiveCovenant(covenant)}>
                    {englishToLepchaMap[String.fromCharCode(65 + index)]}
                </div>
            ))}
            </div>
            {Array.from({ length: activeCovenant.modifiers.length + 1 }).map((_, i) => (
                <CovenantCard 
                    key={i} 
                    i={i} 

                    clauseData={i === 0 ? activeCovenant : activeCovenant.modifiers[i-1]} 
                    type={i === 0 ? "mainClause" : "modifier"} 
                    
                    currentCount={currentCount}
                    isExpanded={expandedIndex === i}
                    isAnyExpanded={isAnyExpanded}
                    selectionFragment={selectionFragment}
                />
            ))}
        </div>
      </animated.div>
    )
  }

function CovenantCard({ i, clauseData, type, currentCount, isExpanded, isAnyExpanded, selectionFragment }){
    const id = clauseData.id
    const covenantCardRef = useRef(null);
    const [ref, { height: contentHeight }] = useMeasure();
    const { focusOnComponent, setFocusOnComponent, setJournalZooms } = useStarFireSync()

    const expand = useSpring({
        config: { friction: 10 },
        height: contentHeight ? contentHeight : 'fit-content'
    });

    useEffect(() => {
        function handleClickOutside(event) {
            if (focusOnComponent.active && 
                focusOnComponent.componentId === id && 
                covenantCardRef.current && 
                !covenantCardRef.current.contains(event.target)) {

                    setFocusOnComponent({ active: false, restoreBounds: true })
    
                    // remove event listener
                    document.removeEventListener("mousedown", handleClickOutside);
            }
        }
        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [covenantCardRef, focusOnComponent]);

    function handleClickInside(){
        console.log("CLICKED INSIDE", focusOnComponent.component, type, focusOnComponent.component !== type)
        if(focusOnComponent.componentId !== id){
            setJournalZooms(true)
            setFocusOnComponent({ active: true, component: type, 
                                  componentId: id,
                                  componentRef: covenantCardRef, 
                                  opacity: 0.1})
        }
    }

    return(
       <motion.div 
            className={styles.covenantCard} 
            key={i} 
            ref={covenantCardRef}
        
            style={{ 
                filter: (focusOnComponent.active && focusOnComponent.componentId !== id) ? `opacity(${focusOnComponent.opacity})` : 'none'
             }}
            // onMouseEnter={() => setHoverProps({ scale: 1.1, rot: 0 })}
            // onMouseLeave={() => setHoverProps({ scale: 1, rot: (isExpanded || isAnyExpanded) ? 0 : rot })}
            >
            <animated.div 
                className={styles.covenantCardInner}
                onClick={handleClickInside}
                style={{
                    height: expand.height
                }}
                >
                <div ref={ref} className={styles.covenantCardHeightController} >
                    {/* COLLAPSED CARD */}
                    <AnimatePresence mode="wait">
                        <LayoutGroup>
                            {focusOnComponent.componentId !== id &&
                                <div className={styles.cardContainer} key="collapsedCard">
                                    {type === "mainClause"
                                        ? <MainClauseCard
                                            index={i}
                                            covenant={clauseData}
                                            currentCount={currentCount}
                                            selectionFragment={selectionFragment}
                                            covenantCardRef={covenantCardRef}
                                        />
                                        : <ModifierCard index={i} modifier={clauseData} currentCount={currentCount} />}
                                </div>
                            }
                            {focusOnComponent.componentId === id &&
                                <div className={styles.cardContainer} key="expandedCard">
                                    {type === "mainClause"
                                        ? <ExpandedMainClauseCard
                                            index={i}
                                            covenant={clauseData}
                                            currentCount={currentCount}
                                            selectionFragment={selectionFragment}
                                            covenantCardRef={covenantCardRef}
                                        />
                                        : <ExpandedModifierCard index={i} modifier={clauseData} currentCount={currentCount} />}
                                </div>
                            }
                        </LayoutGroup>
                    </AnimatePresence>
                </div>
            </animated.div>
       </motion.div> 
    )
}

function MainClauseCard({ index, covenant, currentCount, selectionFragment, covenantCardRef }){

    const cardMap = {
        CONNECT_TO_OWN_WORK: <ConnectCard index={index} covenant={covenant} selectionFragment={selectionFragment} covenantCardRef={covenantCardRef} currentCount={currentCount} />,
        CONNECT_TO_FOUND_ITEM: <ConnectCard />,
        CONNECT_TO_INTERESTING_PERSON: <ConnectCard />,
        ATTACH_NOVEL_THOUGHT: <ConnectCard />,
    }

    return(
        <>
            <motion.div
                className={styles.mainClauseContainer}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <CovenantMainClause covenant={covenant} currentCount={currentCount} covenantCardRef={covenantCardRef} />
                {cardMap[covenant.covenantType]}
            </motion.div>
        </>
    )
}

function ExpandedMainClauseCard({}){
    return(
        <motion.div
            className={styles.expandedCardContainer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <h1>Hi!</h1>
        </motion.div>
    )
}
   
function ModifierCard({ modifier, currentCount }){

    const modifierMap = {
        JUSTIFY: <JustifyCard modifier={modifier} />,
    }

    return(
        <motion.div 
            className={styles.clauseContainer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            >
            <div className={styles.clauseTitleContainer}>
                <CovenantConjunction modifier={modifier} />
                <CovenantClause modifier={modifier} currentCount={currentCount} />
            </div>
            {modifierMap[modifier.modifier]}
        </motion.div>

    )
}

function ExpandedModifierCard({}){
    return(
        <motion.div
            className={styles.expandedCardContainer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <h1>Hi!</h1>
        </motion.div>
    )
}