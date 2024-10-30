import styles from './JournalCovenants.module.css';
import labelStyles from '~/components/canvas/custom-ui/utilities/ConstellationLabelPainter.module.css';
import { motion, useAnimation } from 'framer-motion';
import { useSprings, animated, to as interpolate, useSpring } from '@react-spring/web'
import { useDrag } from 'react-use-gesture'
import { useState, useEffect } from 'react';
import { Covenant, CovenantMainClause, CovenantConjunction, CovenantClause } from "~/components/canvas/custom-ui/utilities/ConstellationLabelPainter.jsx"
import { useDataContext } from "~/components/synchronization/DataContext"
import { englishToLepchaMap } from "~/components/canvas/helpers/language-funcs.js"

import { ConnectCard } from './clause-cards/ConnectCard.jsx'
import { JustifyCard } from './clause-cards/JustifyCard.jsx'

function CovenantCards({ activeCovenant, selectionFragment }) {
    const [currentCount, setCurrentCount] = useState(activeCovenant.times);
    const [expandedIndex, setExpandedIndex] = useState(null);

    const handleClick = (index) => {
        console.log("INDEX CLICKED:", index)
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    const isAnyExpanded = expandedIndex !== null;

    // Calculate the total vertical offset
    const totalOffsetY = 180;
    
    const to = (i) => ({
        x: 0,
        y: i * 180 - totalOffsetY, // Adjust the vertical position
        scale: 1,
        rot: -10 + Math.random() * 20,
        delay: i * 100,
    })
    
    const from = (_i) => ({ x: 0, rot: 0, scale: 1.5, y: -1000 })
    const trans = (r, s) =>
        `rotateX(30deg) rotateY(${r / 10}deg) rotateZ(${r}deg) scale(${s})`
    
    
    useEffect(() => {
        console.log('ACTIVE COVENANT', activeCovenant)
    }, [activeCovenant])

    const { data } = useDataContext();

    const [gone] = useState(() => new Set())
    const [props, api] = useSprings(activeCovenant.modifiers.length + 1, (i) => ({
        ...to(i),
        from: from(i),
    }))

  return (
    <div className={styles.container}>
     <div className={styles.journalCovenantSwitcher}>
            {data.user.covenants.map((covenant, index) => (
            <div key={index} className={styles.covenantSwitcherItem} onClick={() => setActiveCovenant(covenant)}>
                {englishToLepchaMap[String.fromCharCode(65 + index)]}
            </div>
            ))}
        </div>
      {props.map(({ x, y, rot, scale }, i) => (
        <CovenantCard 
            key={i} 
            i={i} 
            // x={x} 
            // y={y} 
            // rot={rot} 
            // scale={scale} 
            // trans={trans}
            clauseData={i === 0 ? activeCovenant : activeCovenant.modifiers[i-1]} 
            type={i === 0 ? "mainClause" : "modifier"} 
            
            currentCount={currentCount}
            handleClick={() => handleClick(i)}
            isExpanded={expandedIndex === i}
            isAnyExpanded={isAnyExpanded}
            selectionFragment={selectionFragment}
        />
      ))}
    </div>
  )
}


function CovenantCard({ i, x, y, rot, scale, clauseData, type, trans, currentCount, handleClick, isExpanded, isAnyExpanded, selectionFragment }){
    const { flex } = useSpring({
        flex: !isAnyExpanded ? 1 : (isExpanded ? 1 : 0.2),
        config: { tension: 100, friction: 15 }
    });

    return(
       <animated.div 
            className={styles.covenantCard} 
            key={i} 
            style={{ 
                border: '2px solid black',
                flex: flex, // Use the spring value for flex
             }}
            // onMouseEnter={() => setHoverProps({ scale: 1.1, rot: 0 })}
            // onMouseLeave={() => setHoverProps({ scale: 1, rot: (isExpanded || isAnyExpanded) ? 0 : rot })}
            onClick={handleClick}>
        <animated.div className={styles.covenantCardInner}
            style={{ 
                // transform: interpolate([hoverProps.rot, hoverProps.scale], trans),
                border: "2px solid pink",
                // height: expandProps.height, 

            }}>
            {type === "mainClause" 
            ? <MainClauseCard covenant={clauseData} currentCount={currentCount} handleClick={handleClick} selectionFragment={selectionFragment} /> 
            : <ModifierCard modifier={clauseData} currentCount={currentCount} />}
        </animated.div>
       </animated.div> 
    )
}

function MainClauseCard({ covenant, currentCount, handleClick, selectionFragment }){

    const cardMap = {
        CONNECT_TO_OWN_WORK: <ConnectCard covenant={covenant} selectionFragment={selectionFragment} />,
        CONNECT_TO_FOUND_ITEM: <ConnectCard />,
        CONNECT_TO_INTERESTING_PERSON: <ConnectCard />,
        ATTACH_NOVEL_THOUGHT: <ConnectCard />,
    }

    return(
        <div onClick={handleClick}>
        <CovenantMainClause covenant={covenant} currentCount={currentCount} />
        {cardMap[covenant.covenantType]}
       </div>
    )
}
   
function ModifierCard({ modifier, currentCount }){


    const modifierMap = {
        JUSTIFY: <JustifyCard modifier={modifier} />,
    }

    return(
        <div className={styles.clauseContainer}>
            <div className={styles.clauseTitleContainer}>
                <CovenantConjunction modifier={modifier} />
                <CovenantClause modifier={modifier} currentCount={currentCount} />
            </div>
            {modifierMap[modifier.modifier]}
        </div>

    )
}

export function JournalCovenants({ shape, selectionFragment, journalCovenantsRef, annotationsExpanded }) {
  const { data } = useDataContext();
  const [activeCovenant, setActiveCovenant] = useState(data.user.covenants[0]);

  const { flex } = useSpring({
    flex: annotationsExpanded ? 1 : 0.5,
    config: { tension: 100, friction: 15 }
});

  return (
    <animated.div 
        className={styles.journalCovenants}
        style={{
            flex: flex,
        }}
        ref={journalCovenantsRef}
        
        >
        <CovenantCards 
          activeCovenant={activeCovenant}
          selectionFragment={selectionFragment}
        />
    </animated.div>
  )
}


// const bind = useDrag(
//     ({ args: [index], down, movement: [mx], direction: [xDir], velocity }) => {
//       const trigger = velocity > 0.2
//       const dir = xDir < 0 ? -1 : 1
//       if (!down && trigger) gone.add(index)
//       api.start((i) => {
//         if (index !== i) return
//         const isGone = gone.has(index)
//         const x = isGone
//           ? (200 + window.innerWidth) * dir
//           : down
//           ? mx
//           : 0
//         const rot = mx / 100 + (isGone ? dir * 10 * velocity : 0)
//         const scale = down ? 1.1 : 1
//         return {
//           x,
//           rot,
//           scale,
//           delay: undefined,
//           config: { friction: 50, tension: down ? 800 : isGone ? 200 : 500 },
//         }
//       })
//       if (!down && gone.size === cards.length)
//         setTimeout(() => {
//           gone.clear()
//           api.start((i) => to(i))
//         }, 600)
//     }
//   )