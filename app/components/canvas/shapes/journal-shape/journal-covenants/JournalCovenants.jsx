import styles from './JournalCovenants.module.css';
import labelStyles from '~/components/canvas/custom-ui/utilities/ConstellationLabelPainter.module.css';
import { motion, useAnimation } from 'framer-motion';
import { useSprings, animated, to as interpolate, useSpring } from '@react-spring/web'
import { useDrag } from 'react-use-gesture'
import { useState, useEffect } from 'react';
import { Covenant, CovenantMainClause, CovenantConjunction, CovenantClause } from "~/components/canvas/custom-ui/utilities/ConstellationLabelPainter.jsx"
import { useDataContext } from "~/components/synchronization/DataContext"
import { englishToLepchaMap } from "~/components/canvas/helpers/language-funcs.js"

function CovenantCards({ activeCovenant }) {
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
        />
      ))}
    </div>
  )
}


function CovenantCard({ i, x, y, rot, scale, clauseData, type, trans, currentCount, handleClick, isExpanded, isAnyExpanded }){
    // const [hoverProps, setHoverProps] = useSpring(() => ({
    //     scale: 1,
    //     rot: (isExpanded || isAnyExpanded) ? 0 : rot,
    //     config: { tension: 300, friction: 20 }
    // }));

    // const [expandProps] = useSpring(() => ({
    //     height: isExpanded ? '250%' : isAnyExpanded ? '50%' : '100%', // Adjust height based on state
    //     config: { tension: 300, friction: 20 },
    //     rot: (isExpanded || isAnyExpanded) ? 0 : rot,
    // }), [isExpanded, isAnyExpanded]);

    return(
       <animated.div 
            className={styles.covenantCard} 
            key={i} 
            style={{ border: '2px solid black' }}
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
            ? <MainClauseCard covenant={clauseData} currentCount={currentCount} handleClick={handleClick} /> 
            : <ModifierCard modifier={clauseData} currentCount={currentCount} />}
        </animated.div>
       </animated.div> 
    )
}

function MainClauseCard({ covenant, currentCount, handleClick }){
    return(
        <div onClick={handleClick}>
        <CovenantMainClause covenant={covenant} currentCount={currentCount} />
       </div>
    )
}
   
function ModifierCard({ modifier, currentCount }){
    return(
            <p className={labelStyles.clauseContainer}>
                <CovenantConjunction modifier={modifier} />
                <CovenantClause modifier={modifier} currentCount={currentCount} />
            </p>

    )
}

export function JournalCovenants({ shape }) {
  const { data } = useDataContext();
  const [activeCovenant, setActiveCovenant] = useState(data.user.covenants[0]);

  return (
    <div className={styles.journalCovenants}>
        <CovenantCards 
          activeCovenant={activeCovenant}
        />
    </div>
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