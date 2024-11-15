import { useState, useEffect, useRef } from 'react';
import styles from './ModernJournal.module.css';
import { JournalThread } from '~/components/canvas/shapes/journal-shape/parchment-journal/journal-thread/JournalThread.jsx'
import { motion, useAnimate } from 'framer-motion';
import { useStarFireSync } from '~/components/synchronization/StarFireSync';
import { BsArrowBarLeft } from "react-icons/bs";
import { FaExpand } from "react-icons/fa";
import { journalRightOffset, journalLeftOffset } from '../JournalShapeUtil';
import { JournalCovenants } from '../journal-covenants/JournalCovenants';
import { JournalArticle } from './JournalArticle';
import { JournalEntries } from './journal-entries/JournalEntries';
import { useCovenantContext } from "~/components/synchronization/CovenantContext"


export function ModernJournal({ shape, contentRef, tldrawEditor }) {
  // DATA CONTEXT
  const { journalMode, setJournalMode, journalZooms, setJournalZooms, focusOnComponent } = useStarFireSync();

  // TEXT EDITOR CONTEXT
  const { annotationsExpanded, setAnnotationsExpanded } = useCovenantContext()

  
  const [scrollChange, setScrollChange] = useState(null)
  const journalCovenantsRef = useRef(null);

  // ANIMATION CONTEXT
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const [scope, animate] = useAnimate();

  useEffect(()=>{
    setIsInitialLoad(false);
  }, [])

  const journalModePages = [
    {
      name: "article",
      displayName: "Article",
    },
    {
      name: 'entries',
      displayName: "Entries",
    }
  ]

  useEffect(()=>{
    console.log("journalMode.page", journalMode.page)
  }, [journalMode.page])


  useEffect(() => {
    if (isInitialLoad) return;
    const offsetX = journalMode.position === 'left' ? window.innerWidth * (journalRightOffset - journalLeftOffset) : -window.innerWidth * (journalRightOffset - journalLeftOffset);
    const animationDuration = 0.2;
    // animate the editor
    animate(contentRef.current, { x: offsetX }, { duration: 0, ease: 'easeInOut' }).then(() => {
      animate(contentRef.current, { x: 0 }, { duration: animationDuration, ease: 'easeInOut' })
    })

    // animate the intro line
    animate(scope.current, { x: offsetX }, { duration: 0, ease: 'easeInOut' }).then(() => {
      animate(scope.current, { x: 0 }, { duration: animationDuration, ease: 'easeInOut' })
    })
  }, [journalMode.position, animate]);

  
 


  const journalModes = {

  }  

  return (
    <>

      <motion.div className={styles.shapeContent}
        ref={contentRef}
        initial={{ opacity: 0}}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          opacity: { duration: 0.5, ease: 'easeInOut' },
        }}
        style={{
          width: journalMode.position === 'left' ? '150%' : '100%',
        }}

        onPointerDown={(e) => {
          e.stopPropagation();
        }}
        onScrollCapture={(e) => {
          setScrollChange(e.target.scrollTop)
          e.stopPropagation()
        }}
        onWheelCapture={(e) => {
          e.stopPropagation();
        }}
      >
        <div 
          className={styles.journalContainer}
          style={{
            filter: (focusOnComponent.active && focusOnComponent.component !== 'journal') ? `opacity(${focusOnComponent.opacity})` : 'none'
          }}
          >
        <motion.div 
          className={styles.journalBackground}
          initial={{ opacity: 0}}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 0.5, ease: 'easeInOut' },
          }}  
          />
        <div className={styles.journalTools}>
          <div
            className={styles.journalToolButton}
            style={{
              transform: journalMode.position === 'left' ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
            onPointerDown={() => {
              console.log("clicked")
              setJournalMode({
                ...journalMode,
                position: journalMode.position === 'left' ? 'right' : 'left',
              })
            }}>
            <BsArrowBarLeft />
          </div>
          <div
            className={styles.journalToolButton}
            style={{
            }}
            onPointerDown={() => {
              console.log("clicked")
              setAnnotationsExpanded(!annotationsExpanded)
            }}>
            <FaExpand />
          </div>
          <div
            className={styles.journalToolButton}
            onPointerDown={() => {
              console.log("clicked")
              setJournalZooms(!journalZooms)
            }}>
            Z
          </div>
        </div>
        <div className={styles.journalContentContainer}>
          <div className={styles.journalController}>
            {journalModePages.map((page, index) => (
              <p key={index} className={styles.journalControllerButton} onClick={() => {
                setJournalMode({...journalMode, page: page.name})
              }}>{page.displayName}</p>
            ))}
          </div>
            {
              {
                'article': <JournalArticle />,
                'entries': <JournalEntries />
              }[journalMode.page] || <JournalEntries />
            }
        </div>
      </div>
      {journalMode.position === 'left' &&
          <JournalCovenants 
            shape={shape} 
            annotationsExpanded={annotationsExpanded}
            journalCovenantsRef={journalCovenantsRef}
            />
      }
      </motion.div> 
      <motion.svg 
        className={styles.animatedLine} 
        viewBox={`0 0 ${shape.props.w} ${shape.props.h}`}
        ref={scope}
        >
        <JournalThread
          d={`M -5 -5 L ${shape.props.w + 5} -5 L ${shape.props.w + 5} ${shape.props.h + 5} L -5 ${shape.props.h + 5} Z`}
          delay={0}
          duration={1}
          strokeWidth={2}
          pageContainer
        />
      </motion.svg>
    </>
  )
}