import styles from './JournalEntry.module.css'
import { JournalThread } from '~/components/canvas/shapes/journal-shape/parchment-journal/journal-thread/JournalThread.jsx'
import { motion } from 'framer-motion'
import { useRef, useEffect, useState } from 'react';
import { ConceptStar } from '~/components/canvas/shapes/concept-shape/ConceptStar';
import { EntryArticle } from './EntryArticle';
import { useEditor, createShapeId } from 'tldraw';
// import { Utils } from "@tldraw/core";
import { Vec } from "tldraw";


export function JournalEntry({ type, entry, shouldAnimate, opacity = 1, onMouseEnter, onMouseLeave, isHovered, isOtherHovered }) {
    const specimenRef = useRef(null);
    const entryRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [pulseTrigger, setPulseTrigger] = useState(0);
    const editor = useEditor();

    const [interactionState, setInteractionState] = useState({
        point: [0, 0],
        state: "idle",
        shapeId: "",
    })

    function handlePointerDown(e){
        e.currentTarget.setPointerCapture(e.pointerId);
        setInteractionState({
            point: [e.clientX, e.clientY],
            state: "pointing",
            shapeId: "",
        })
    };

    function handlePointerMove(e, type){

        console.log("POINTER MOVE", e.clientX, e.clientY)

        switch(interactionState.state){
            case "pointing": {
                const point = [e.clientX, e.clientY]
                if(
                    Math.abs(e.clientX - interactionState.point[0]) > 8 ||
                    Math.abs(e.clientY - interactionState.point[1]) > 8
				){
                    const pagePoint = editor.screenToPage({x: point[0], y: point[1]});

                    if(type === 'concept'){
                        const concept = entry.concept;
                        const shapeId = createShapeId(`drag-${concept.id}`)

                        editor.createShape({
                            type: 'concept',
                            id: shapeId,
                            x: pagePoint.x - 20,
                            y: pagePoint.y - 20,
                            props: {
                                text: concept.title,
                                plainText: concept.title,
                                description: concept.description,
                                databaseId: concept.id,
                            }
                        })    
                        
                        setInteractionState((interactionState) => ({
                            ...interactionState,
                            shapeId,
                            state: "dragging"
                          }));
                    }
                    else if(type === 'article'){
                        const excerpt = entry.excerpt;
                        const shapeId = createShapeId(`drag-${excerpt.id}`)
                        console.log("EXCERPT", excerpt)
                        editor.createShape({
                            type: 'excerpt',
                            id: shapeId,
                            x: pagePoint.x - 20,
                            y: pagePoint.y - 20,
                            props: {
                                content: excerpt.content,
                                databaseId: excerpt.id,
                                media: excerpt.media
                            }
                        })

                        setInteractionState((interactionState) => ({
                            ...interactionState,
                            shapeId,
                            state: "dragging"
                          }));
                    }

                   
                }
                break;
            }

            case "dragging": {
                const point = [e.clientX, e.clientY];
                const pagePoint = editor.screenToPage({x: point[0], y: point[1]});
                editor.updateShape({
                        id: interactionState.shapeId,
                        type: type,
                        x: pagePoint.x - 20,
                        y: pagePoint.y - 20,
                    })
                    
                    
                
                break;
            }
        }
    }

    function handlePointerUp(e){
        e.currentTarget.releasePointerCapture(e.pointerId);

        setInteractionState((interactionState) => ({
            ...interactionState,
            state: "idle"
          }));
    }



    useEffect(() => {
        if (specimenRef.current) {
            const { offsetWidth, offsetHeight } = specimenRef.current;
            setDimensions({ width: offsetWidth, height: offsetHeight });
        }
    }, []);


    // function handleEntryClick(e){
    //     // generate a shape at the click coordinates

    //     // generate x and y
    //     const { x, y } = editor.inputs.currentPagePoint

    //     const clickX = e.clientX, clickY = e.clientY
    //     const rect = entryRef.current.getBoundingClientRect();
    //     const distanceX = clickX - rect.left, distanceY = clickY - rect.top

    //     const { screenX, screenY } = editor.screenToPage(clickX, clickY)

    //     if(type === 'concept'){
    //         const concept = entry.concept;
    //         const shapeId = createShapeId(`drag-${concept.id}`)
    //         editor.run(()=>{
    //         editor.createShape({
    //             type: 'concept',
    //             id: shapeId,
    //             x: x - 20,
    //             y: y - 20,
    //             props: {
    //                 text: concept.title,
    //                 plainText: concept.title,
    //                 description: concept.description,
    //                 databaseId: concept.id,
    //             }
    //         })

    //         editor.setCurrentTool('select.pointing_shape', { id: editor.getShape(shapeId)})
    //         })
    //     }
    //     else if(type === 'article'){
    //         console.log("ENTRY:", entry)
    //         const excerpt = entry.excerpt;
    //         const shapeId = createShapeId(`drag-${excerpt.id}`)
    //         editor.createShape({
    //             type: 'excerpt',
    //             id: shapeId,
    //             x: x - 20,
    //             y: y - 20,
    //             props: {
    //                 content: excerpt.content,
    //                 databaseId: excerpt.id,
    //                 media: excerpt.media
    //             }
    //         })

    //         editor.setCurrentTool('select.pointing_shape', { shape: editor.getShape(shapeId)})
    //     }

    // }



    return (
        <>
            <motion.div 
                className={styles.journalEntry}
                layout
                ref={entryRef}
                onPointerDown={handlePointerDown}
                onPointerMove={(e) => handlePointerMove(e, type)}
                onPointerUp={handlePointerUp}
                initial={{ opacity: shouldAnimate ? 0 : opacity, x: shouldAnimate ? -25 : 0 }}
                animate={{ opacity: opacity, x: 0 }}
                transition={{
                    opacity: { duration: 0.3, ease: "easeInOut", delay: 0},
                    x: { duration: 0.5, ease: "easeInOut", delay: 0.5 }
                }}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            >
                <div className={styles.entrySpecimenOuter}>
                    <div className={styles.entrySpecimen} ref={specimenRef}>
                        {type === 'concept' &&
                            <ConceptStar
                                selected={false}
                                pulseTrigger={pulseTrigger}
                                onClick={() => {
                                    console.log('clicked')
                                    setPulseTrigger(pulseTrigger + 1)
                                }}
                                scale={1.2}
                                animationDelay={0.55}
                                collapsed={false}
                            />
                        }
                        {type === 'article' &&
                            <motion.div 
                                className={styles.entryArticleContainer}
                                initial={{ opacity: shouldAnimate ? 0 : 1}}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, ease: "easeInOut", delay: 0.5 }}
                            >
                                <EntryArticle content={entry?.excerpt?.media?.content || 'No content'} />
                            </motion.div>
                        }
                        <motion.svg className={styles.animatedContainer}>
                            <JournalThread
                                d={`M 0 0 L ${dimensions.width} 0 L ${dimensions.width} ${dimensions.height} L 0 ${dimensions.height} Z`}
                                delay={0.5}
                                duration={1}
                                strokeWidth={1}
                                persist
                                opacity={0.5}
                                shouldAnimate={shouldAnimate}
                            />
                        </motion.svg>
                    </div>
                </div>
                <motion.div 
                    className={styles.entryContent}
                    animate={{ scale: isHovered ? 1.01 : 1 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                    <motion.div className={styles.entryTitle}
                        initial={{ opacity: shouldAnimate ? 0 : 1, x: shouldAnimate ? -100 : 0 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, ease: "easeInOut", delay: 0.5 }}
                    >
                        {type === 'concept' ? entry?.concept?.title || 'No title' : entry?.excerpt?.media?.title || 'No title'}
                    </motion.div>
                    <motion.div className={styles.entryMetadata}
                        initial={{ opacity: shouldAnimate ? 0 : 1, x: shouldAnimate ? -100 : 0 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, ease: "easeInOut", delay: 0.8 }}
                    >
                        {type === 'concept' ? entry?.concept?.user?.name || 'Unknown user' : entry?.excerpt?.media?.user?.name || 'Unknown user'} • {entry?.date || 'Unknown date'}
                    </motion.div>
                    <motion.div className={styles.entryText}
                        initial={{ opacity: shouldAnimate ? 0 : 1, x: shouldAnimate ? -100 : 0 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, ease: "easeInOut", delay: 0.8 }}
                    >
                        {type === 'concept' ? entry?.concept?.description || 'No description' : entry?.excerpt?.content || 'No content'}
                    </motion.div>
                </motion.div>
            </motion.div>
            <div className={styles.divider}>
                <motion.div
                    className={styles.iconLine}
                    style={{ transformOrigin: 'left' }}
                    initial={{ scaleX: shouldAnimate ? 0 : 1 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5, ease: "easeInOut", }}
                />
                <div className={styles.innerIconContainer}>
                    <motion.svg
                        width="100"
                        height="100"
                        viewBox="0 0 100 100"
                        className={styles.innerIcon}
                    >
                        <motion.path
                            d="M50 10 L90 50 L50 90 L10 50 Z"
                            stroke="rgba(255, 255, 255, 0.2)"
                            strokeWidth="20px"
                            fill="transparent"
                            initial={{ pathLength: shouldAnimate ? 0 : 1 }}
                            animate={{ pathLength: 1 }}
                            transition={{
                                duration: 1,
                                ease: "easeInOut",
                                delay: 0.4,
                            }}
                        />
                    </motion.svg>
                </div>
                <motion.div
                    className={styles.iconLine}
                    style={{ transformOrigin: 'right' }}
                    initial={{ scaleX: shouldAnimate ? 0 : 1 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5, ease: "easeInOut", }}
                />
            </div>
        </>
    )
}