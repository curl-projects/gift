import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from "framer-motion";
import styles from "./MinimapPainter.module.css";
import { useDataContext } from "~/components/synchronization/DataContext";
import { englishToLepchaMap } from "~/components/canvas/helpers/language-funcs.js";
import { useStarFireSync } from '~/components/synchronization/StarFireSync';
import { useNavigate, useParams } from '@remix-run/react';
import { createShapeId, useEditor } from 'tldraw';
import { GoalPainter } from './GoalPainter';

export function MinimapPainter() {
    const { data } = useDataContext();
    const { minimapMode, setMinimapMode, journalMode, conceptIsDragging } = useStarFireSync();
    const { person } = useParams();


    useEffect(() => {
        if (journalMode.position === 'left') {
            setMinimapMode({ active: false });
        }
    }, [journalMode]);

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
    }, [conceptIsDragging])

    return (
        <div className={styles.minimap}>
            <AnimatePresence>
                {minimapMode.active && (
                    <>
                        <motion.div
                            className={styles.innerMinimap}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                        exit={{ opacity: 0 }}
                        whileHover={{ opacity: 1, scale: 1.4, x: -100, y: -100 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
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
                        {conceptIsDragging.active && (
                            <motion.div className={styles.draggingContainer}>
                                <p>Dragging...</p>
                            </motion.div>
                        )}
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