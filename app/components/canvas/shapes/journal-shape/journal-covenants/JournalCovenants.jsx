import styles from './JournalCovenants.module.css';
import labelStyles from '~/components/canvas/custom-ui/utilities/ConstellationLabelPainter.module.css';
import { motion, useAnimation, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useSprings, animated, to as interpolate, useSpring } from '@react-spring/web'
import { useDrag } from 'react-use-gesture'
import { useState, useEffect, useRef } from 'react';
import { Covenant, CovenantMainClause, CovenantConjunction, CovenantClause } from "~/components/canvas/custom-ui/utilities/ConstellationLabelPainter.jsx"
import { useDataContext } from "~/components/synchronization/DataContext"
import { englishToLepchaMap } from "~/components/canvas/helpers/language-funcs.js"

import { ConnectCard } from './clause-cards/connect-card/ConnectCard.jsx'
import { ExpandedConnectCard } from './clause-cards/connect-card/ExpandedConnectCard.jsx'

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
    const [isExpanding, setIsExpanding] = useState(false);

    // Measure the expanded content
    const expandedContentRef = useRef();
    const [expandedBoundsRef, { height: expandedContentHeight }] = useMeasure();

    // // Entrance animation with perspective and rotation
    const from = (i) => ({ x: 0, y: -1000, rot: 0, scale: 1.5 })

    const to = (i) => ({
        x: 0,
        y: 0,
        scale: 1,
        rot: (i % 2 === 0 ? -4 : 4), // Alternating rotation
        delay: i * 150,
      })
    
      const trans = (x, y, r, s) =>
        `translateX(${x}px) translateY(${y}px) perspective(1500px) rotateX(0deg) rotateY(0deg) rotateZ(${r}deg) scale(${s})`;

    const props = useSpring({
        to: to(i),
        from: from(i),
        config: { tension: 185, friction: 26 }, // Configure the spring animation
      });

    const animatedStyle = {
        transform: interpolate(
            [props.x, props.y, props.rot, props.scale],
            (x, y, r, s) => trans(x, y, r, s)
        )
    };

    const expand = useSpring({
        config: { tension: 120, friction: 14 },
        height: contentHeight || 'fit-content',
    });  

    useEffect(() => {
        if (isExpanding && expandedContentHeight) {
            setFocusOnComponent({
                active: true,
                component: type,
                componentId: id,
                componentRef: covenantCardRef,
                opacity: 0.1,
                finalHeight: expandedContentHeight, // Use the measured expanded content height
            });
            setIsExpanding(false);
        }
    }, [isExpanding, expandedContentHeight]);

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
            setIsExpanding(true)
        }
    }

    return(
       <animated.div 
            className={styles.covenantCard} 
            key={i} 
            ref={covenantCardRef}
        
            style={{ 
                ...animatedStyle,
                // ...entranceAnimation, // Apply the entrance animation
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
                <div 
                    ref={ref} 
                    className={styles.covenantCardHeightController} 
                    key={focusOnComponent.componentId === id ? 'expanded' : 'collapsed'}>
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
                                        : <ExpandedModifierCard index={i} modifier={clauseData} currentCount={currentCount} ref={expandedContentRef} />}
                                </div>
                            }
                        </LayoutGroup>
                    </AnimatePresence>
                </div>
            </animated.div>

            {/* Hidden expanded content for measurement */}
            <div
                ref={expandedBoundsRef}
                style={{
                    position: 'absolute',
                    visibility: 'hidden',
                    pointerEvents: 'none',
                    height: 'auto',
                    width: '100%',
                    overflow: 'hidden',
                }}
            >
                {type === 'mainClause' ? (
                    <ExpandedMainClauseCard
                        index={i}
                        covenant={clauseData}
                        currentCount={currentCount}
                        selectionFragment={selectionFragment}
                        covenantCardRef={covenantCardRef}
                    />
                ) : (
                    <ExpandedModifierCard index={i} modifier={clauseData} currentCount={currentCount} />
                )}
            </div>
       </animated.div> 
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

function ExpandedMainClauseCard({ index, covenant, selectionFragment, covenantCardRef, currentCount }){

    const cardMap = {
        CONNECT_TO_OWN_WORK: <ExpandedConnectCard index={index} covenant={covenant} selectionFragment={selectionFragment} covenantCardRef={covenantCardRef} currentCount={currentCount} />,
        CONNECT_TO_FOUND_ITEM: <ExpandedConnectCard />,
        CONNECT_TO_INTERESTING_PERSON: <ExpandedConnectCard />,
        ATTACH_NOVEL_THOUGHT: <ExpandedConnectCard />,
    }

    return(
        <motion.div
            className={styles.expandedCardContainer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {cardMap[covenant.covenantType]}
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