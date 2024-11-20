import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import styles from "./MinimapPainter.module.css";
import { useDataContext } from "~/components/synchronization/DataContext";
import { englishToLepchaMap } from "~/components/canvas/helpers/language-funcs.js";
import { useStarFireSync } from '~/components/synchronization/StarFireSync';
import { useNavigate, useParams } from '@remix-run/react';
import { createShapeId, useEditor } from 'tldraw';
import { GoalPainter } from './GoalPainter';
import { JournalThread } from '~/components/canvas/shapes/journal-shape/parchment-journal/journal-thread/JournalThread';
import { FaJournalWhills } from "react-icons/fa";

export function MinimapPainter() {
    const { data } = useDataContext();
    const editor = useEditor()
    const { minimapMode, setMinimapMode, journalMode, conceptIsDragging, setConceptIsDragging } = useStarFireSync();
    const { person } = useParams();

    const minimapRef = useRef(null);
    const draggingContainerRef = useRef(null);

    const [isHovered, setIsHovered] = useState(false);

    // Initialize animation controls for the ripple effect

    useEffect(() => {
        if (journalMode.position === 'left') {
            setMinimapMode({ active: false });
        }
    }, [journalMode]);

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


    useEffect(()=>{
        const shapes = editor.getCurrentPageShapes().filter(shape => ['concept', 'name', "excerpt"].includes(shape.type))

        if(conceptIsDragging.active){
            const blurShapes = shapes.filter(shape => shape.id !== conceptIsDragging.id)
            editor.run(()=>{
                editor.updateShapes(blurShapes.map(shape => ({...shape, opacity: 0.3})))
            }, { ignoreShapeLock: true })
        }
        else{
            editor.run(()=>{
                editor.updateShapes(shapes.map(shape => ({...shape, opacity: 1})))
            }, { ignoreShapeLock: true })
        }
    }, [conceptIsDragging])




    const allPeople = [
        { name: "A Complete Stranger", uniqueName: "stranger" },
        { name: "Shakespeare", uniqueName: "shakespeare" },
        { name: "That Coworker That You Hung Out With That One Time", uniqueName: "coworker" },
        { name: "David Attenborough", uniqueName: "attenborough" },
        { name: "Yourself", uniqueName: "yourself" },
        { name: "Andre Vacha", uniqueName: "andre-vacha" }
    ];

    // Include all people, including the current user
    const people = allPeople;

    // Define consistent positions for the stars
    const starPositions = [
        { x: -60, y: -40 },
        { x: -30, y: 50 },
        { x: 50, y: -30 },
        { x: 60, y: 40 },
        { x: 0, y: -70 },
        { x: 0, y: 70 } // Added an extra position if necessary
    ];

    // Assign positions to each person
    const stars = people.map((person, index) => {
        const position = starPositions[index % starPositions.length];
        return { ...position, person };
    });

    useEffect(()=>{
        if(conceptIsDragging.active){
            setMinimapMode({ active: true })
        }
    }, [conceptIsDragging.overlap])
    
    useEffect(()=>{
        if(conceptIsDragging.overlap){
            console.log("OVERLAP")
        }
    }, [conceptIsDragging])

    return (
        <div ref={minimapRef} className={styles.minimap}>
            <AnimatePresence>
                {minimapMode.active && (
                    <>
                        <motion.div
                            className={styles.innerMinimap}
                            initial={{ opacity: 0 }}
                            animate={{
                                opacity: isHovered ? 1 : 0.6,
                                scale: ((conceptIsDragging.active && conceptIsDragging.overlap) || isHovered) ? 1.4 : 1,
                            }}
                            exit={{ opacity: 0 }}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            transition={{ 
                                duration: 0.2, 
                                ease: "easeInOut", 
                                scale: { type: "spring", stiffness: 300, damping: 20 } }}
                            style={{ transformOrigin: 'bottom right' }}
                        >
                            <GoalPainter />   

                            {/* Render stars at consistent positions */}
                            {!conceptIsDragging.active && stars.map((star, index) => (
                                <NewStar
                                    key={index}
                                    x={star.x}
                                    y={star.y}
                                    person={star.person}
                                    isActive={star.person.uniqueName === person}
                                />
                            ))}
                            <AnimatePresence>
                                {conceptIsDragging.active && (
                                    <motion.div
                                        ref={draggingContainerRef}
                                        className={styles.draggingContainer}
                                        initial={{ 
                                            boxShadow: '0 0 0 rgba(255, 255, 255, 0)'  
                                        }}
                                        animate={{
                                            boxShadow: [
                                            '0 0 0 rgba(255, 255, 255, 0)',
                                            '0 0 20px rgba(255, 255, 255, 0.8)',
                                            '0 0 40px rgba(255, 255, 255, 0)',
                                        ]
                                            // scale: conceptIsDragging.overlap ? 1.1 : [0.9, 1]
                                        }}
                                        exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                    <motion.div 
                                        initial={{ opacity: 0, boxShadow: '0 0 40px rgba(255, 255, 255, 0)'   }}
                                        animate={{ 
                                            opacity: conceptIsDragging.overlap ? 1 : 0.5, 
                                            // boxShadow: [
                                            //     '0 0 0 rgba(255, 255, 255, 0)',
                                            //     '0 0 20px rgba(255, 255, 255, 0.8)',
                                            //     '0 0 40px rgba(255, 255, 255, 0)',
                                            // ]
                                        }}
                                        exit={{ opacity: 0 }}
                                        className={styles.draggingMessage}
                                        transition={{
                                            // boxShadow: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                                            opacity: { duration: 0.5, ease: "easeInOut" }
                                        }}
                                        
                                        >
                                            <FaJournalWhills />
                                    </motion.div>
                                        
                                        <motion.svg className={styles.animatedContainer}>
                                            <JournalThread
                                                d={`M 0 0 L ${draggingContainerRef?.current?.offsetWidth || 0} 0 L ${draggingContainerRef?.current?.offsetWidth || 0} ${draggingContainerRef?.current?.offsetHeight || 0} L 0 ${draggingContainerRef?.current?.offsetHeight || 0} Z`}
                                                delay={0}
                                                duration={0.3}
                                                strokeWidth={1}
                                                persist
                                                opacity={0.8}
                                                shouldAnimate={true}
                                            />
                                        </motion.svg>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

export function NewStar({ x, y, person, isActive }) {
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();
    const { setTriggerWarp, setConstellationLabel } = useStarFireSync();

    return (
        <div
            className={`${styles.newStar} ${isActive ? styles.activeStarContainer : ''}`}
            style={{ transform: `translate(${x}px, ${y}px) translate(-50%, -50%)` }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => {
                navigate(`/pitch-deck/${person.uniqueName}`, { replace: false });
                setTriggerWarp({
                    active: true,
                    accDuration: 1000,
                    deaccDuration: 2000,
                    constAccDuration: 1000
                }).then(() => {
                    setConstellationLabel({
                        visible: true,
                        immediate: false,
                        duration: 2,
                        delay: 0,
                        text: person.name
                    });
                });
            }}
        >
            {isHovered && (
                <motion.div
                    className={styles.hoverDescription}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: "linear" }}
                >
                    <p>{person.name}</p>
                </motion.div>
            )}
            <motion.p
                className={styles.newStarText}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "linear", delay: 0.5 }}
            >
                {englishToLepchaMap[person.name[0]]}
            </motion.p>
        </div>
    );
}