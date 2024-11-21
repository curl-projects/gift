import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import styles from "./MinimapPainter.module.css";
import { useDataContext } from "~/components/synchronization/DataContext";
import { useStarFireSync } from '~/components/synchronization/StarFireSync';
import { useEditor } from 'tldraw';
import { GoalPainter } from '../GoalPainter';
import { MinimapDrag } from './MinimapDrag';
import { MinimapTraversal } from './MinimapTraversal';
import { FaExpandAlt } from "react-icons/fa";

export function MinimapPainter() {
    const { data } = useDataContext();
    const editor = useEditor()
    const { minimapMode, setMinimapMode, journalMode, conceptIsDragging, setConceptIsDragging } = useStarFireSync();
    

    const minimapRef = useRef(null);

    useEffect(() => {
        // Update minimap's bounding rect in conceptIsDragging state
        function updateMinimapRect() {
            if (minimapRef.current) {
                const rect = minimapRef.current.getBoundingClientRect();
                setConceptIsDragging(prevState => ({
                    ...prevState,
                    minimapRect: rect,
                }));
            }
        }

        // Update on mount and when minimapMode changes
        updateMinimapRect();

        window.addEventListener('resize', updateMinimapRect);
        window.addEventListener('scroll', updateMinimapRect);

        return () => {
            window.removeEventListener('resize', updateMinimapRect);
            window.removeEventListener('scroll', updateMinimapRect);
        };
    }, [minimapMode.active]);


    // Initialize animation controls for the ripple effect

    useEffect(() => {
        if (journalMode.position === 'left') {
            setMinimapMode({ active: false });
        }
    }, [journalMode]);


    return (
        <div ref={minimapRef} className={styles.minimap}>
            <AnimatePresence>
                {minimapMode.active && 
                    <>
                        <motion.div
                            className={styles.innerMinimap}
                            initial={{ opacity: 0 }}
                            animate={{
                                opacity: (minimapMode.hovered || minimapMode.expanded) ? 1 : 0.6,
                                scale: (minimapMode.expanded) ? minimapMode.expandedScale :
                                       (conceptIsDragging.active && conceptIsDragging.overlap) ? minimapMode.dragScale :
                                       (!conceptIsDragging.active && !conceptIsDragging.overlap && minimapMode.hovered) ? minimapMode.hoveredScale : 1,
                            }}
                            exit={{ opacity: 0 }}
                            onMouseEnter={() => setMinimapMode(prevState => ({...prevState, hovered: true}))}
                            onMouseLeave={() => setMinimapMode(prevState => ({...prevState, hovered: false}))}
                            // onPointerDown={() => setMinimapMode(prevState => ({...prevState, expanded: !prevState.expanded}))}
                            transition={{ 
                                duration: 0.2, 
                                ease: "easeInOut", 
                                scale: { duration: 0.3, ease: "easeInOut" } }}
                            style={{ transformOrigin: 'bottom right' }}
                        >
                          
                            <GoalPainter />  
                            <motion.div 
                                className={styles.expandingButton}
                                onClick={() => setMinimapMode(prevState => ({...prevState, expanded: !prevState.expanded || true }))}
                                style={{
                                    position: 'absolute',
                                    top: "10px",
                                    right: "10px",
                                    cursor: 'pointer',
                                    color: "rgba(0, 0, 0, 0.7)",
                                    zIndex: 100000000,
                                }}
                             >
                                <FaExpandAlt />
                            </motion.div>  
                            <AnimatePresence>
                                {!conceptIsDragging.active && <MinimapTraversal />}
                                {conceptIsDragging.active && (
                                    <MinimapDrag minimapRef={minimapRef} />
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </>
                }
            </AnimatePresence>
        </div>
    );
}

