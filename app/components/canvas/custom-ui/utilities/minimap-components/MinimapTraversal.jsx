import { useParams, useNavigate } from '@remix-run/react';
import { useState, useEffect } from 'react';
import styles from './MinimapPainter.module.css';
import { useStarFireSync } from '~/components/synchronization/StarFireSync';
import { motion } from 'framer-motion';
import { englishToLepchaMap } from '~/components/canvas/helpers/language-funcs';

export function MinimapTraversal(){

    // approach:
    // if the concepts are expanded or they're drifting, show new people
    // if a concept is focused, show related concepts
    // if an excerpt is focused, show related excerpts

    const { person } = useParams();
    const [traversalMode, setTraversalMode] = useState('people'); // people, concepts, excerpts

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

    return(
        <>
        {
          stars.map((star, index) => (
            <NewStar
                key={index}
                x={star.x}
                y={star.y}
                person={star.person}
                isActive={star.person.uniqueName === person}
                />  
            ))}
        </>
    )
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