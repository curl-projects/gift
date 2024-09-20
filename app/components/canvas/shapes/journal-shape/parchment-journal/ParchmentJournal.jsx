import styles from './ParchmentJournal.module.css'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { JournalThread } from './journal-thread/JournalThread.jsx'
import { JournalBorder } from './journal-border/JournalBorder.jsx'
import { JournalMenu } from './journal-menu/JournalMenu.jsx'

// pages
import {Cover} from './journal-pages/cover/Cover';
import {Pitch} from './journal-pages/pitch/Pitch';


export function ParchmentJournal({ shape, journalMode, contentRef }){
    const [inkVisible, setInkVisible] = useState(false);

    const [outerBorderVisibility, setOuterBorderVisibility] = useState({
        bottom: false,
        left: false,
        right: false,
        top: false,
    });
    const [innerBorderVisibility, setInnerBorderVisibility] = useState({
        bottom: false,
        left: false,
        right: false,
        top: false,
    });

    const [page, setPage] = useState(shape.props.page);

    return (
        <>
        <div 
            className={styles.shapeContent}
            ref={contentRef}
            onPointerDown={(e) => {
                e.stopPropagation();
            }}
            onScrollCapture={(e) => e.stopPropagation()}
            onWheelCapture={(e) => {
                e.stopPropagation();
            }}
            style={{
                }}   
            >
            <motion.div
                className={styles.shapeContentBackground}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1 }} // Adjust delay as needed
                onAnimationComplete={(animation) => {
                    console.log("BACKGROUND COMPLETED")
                    if(animation?.opacity === 1){
                        setInkVisible(true)

                        setTimeout(()=>{
                            journalMode.onComplete && journalMode.onComplete()
                        }, 1000)
                    }
                }}
                style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                willChange: 'opacity', // Add will-change property
                // backgroundImage: 'url("/assets/old-paper.jpg")',
                // backgroundSize: 'cover',
                // backgroundPosition: 'center',
                }}
            />

                            
                {/* outer border */}
                <JournalBorder borderThickness={4} distance={20} borderVisibility={outerBorderVisibility} />

                {/* inner border */}
                <JournalBorder borderThickness={2} distance={30} borderVisibility={innerBorderVisibility}/>

            
                {inkVisible && (
                    <>
                    <JournalMenu page={page} setPage={setPage}/>
                    {/* <InkBleed 
                        initialBlur={200}
                        delay={0}
                        duration={4}
                    >
                    <div className={styles.exampleCircle}/>
                    </InkBleed> */}
                    <div className={styles.journalPageContainer}>
                            <AnimatePresence>
                            {
                                {
                                    'cover': <Cover key='cover'/>,
                                    'pitch': <Pitch key='pitch'/>,
                                }[page]
                            }
                        </AnimatePresence>
                    </div>
                </>
                )}
        </div>

        
        <svg className={styles.animatedLine} viewBox={`0 0 ${shape.props.w} ${shape.props.h}`}>

            <JournalThread 
                d={`M -5 -5 L ${shape.props.w + 5} -5 L ${shape.props.w + 5} ${shape.props.h + 5} L -5 ${shape.props.h + 5} Z`} 
                delay={0} 
                duration={1} 
                strokeWidth={1} 
                pageContainer 
            />

            {/* outer line */}

            {/* top */}
            <JournalThread 
                d={`M 20 20 L ${shape.props.w - 20} 20`} 
                delay={1}
                duration={0.5}
                strokeWidth={1} 
                onOpaque={() => setOuterBorderVisibility(prevState => ({...prevState, left: true}))}
            />

            {/* { left } */}
            <JournalThread 
                d={`M 20 20 L 20 ${shape.props.h - 20}`} 
                delay={1} 
                duration={0.5}
                strokeWidth={1} 
                onOpaque={() => setOuterBorderVisibility(prevState => ({...prevState, top: true}))}
            />
            
            {/* bottom */}
            <JournalThread 
                d={`M 20 ${shape.props.h - 20} L ${shape.props.w - 20} ${shape.props.h - 20}`} 
                delay={1.3}
                duration={0.5}
                strokeWidth={1} 
                onOpaque={() => setOuterBorderVisibility(prevState => ({...prevState, right: true}))}
            />

            {/* right */}
            <JournalThread 
                d={`M ${shape.props.w - 20} 20 L ${shape.props.w - 20} ${shape.props.h - 20}`} 
                delay={1.3}
                duration={0.5}
                strokeWidth={1} 
                onOpaque={() => setOuterBorderVisibility(prevState => ({...prevState, bottom: true}))}
            />

            {/* inner line */}
            <JournalThread 
                d={`M 30 30 L ${shape.props.w - 30} 30`} 
                delay={1.5}
                duration={0.5} 
                strokeWidth={1} 
                onOpaque={() => setInnerBorderVisibility(prevState => ({...prevState, left: true}))}
            />
            <JournalThread 
                d={`M 30 30 L 30 ${shape.props.h - 30}`} 
                delay={1.5}
                duration={0.5} 
                strokeWidth={1} 
                onOpaque={() => setInnerBorderVisibility(prevState => ({...prevState, top: true}))}
            />
            <JournalThread 
                d={`M 30 ${shape.props.h - 30} L ${shape.props.w - 30} ${shape.props.h - 30}`} 
                delay={1.8} 
                duration={0.5}
                strokeWidth={1} 
                onOpaque={() => setInnerBorderVisibility(prevState => ({...prevState, right: true}))}
            />
            <JournalThread 
                d={`M ${shape.props.w - 30} 30 L ${shape.props.w - 30} ${shape.props.h - 30}`} 
                delay={1.8} 
                duration={0.5}
                strokeWidth={1} 
                onOpaque={() => {
                    setInnerBorderVisibility(prevState => ({...prevState, bottom: true}))
                }}
            />

        </svg>
    </>
    )
}