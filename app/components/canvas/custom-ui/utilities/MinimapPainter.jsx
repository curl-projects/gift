import { useState } from 'react';
import { AnimatePresence, motion } from "framer-motion";
import styles from "./MinimapPainter.module.css";
import { useDataContext } from "~/components/synchronization/DataContext";
import { englishToLepchaMap, getRandomLepchaCharacter } from "~/components/canvas/helpers/language-funcs.js"
import { useStarFireSync } from '~/components/synchronization/StarFireSync'
import { useNavigate } from '@remix-run/react';
import { JournalThread } from '~/components/canvas/shapes/journal-shape/parchment-journal/journal-thread/JournalThread';
import { createShapeId, useEditor } from 'tldraw';

export function MinimapPainter() {
    const { data } = useDataContext()
    const { minimapMode } = useStarFireSync()

    const allPeople = [
        {
            name: "A Complete Stranger",
            uniqueName: "stranger",
        },
        {
            name: "Shakespeare",
            uniqueName: "shakespeare",
        },
        {
            name: "That Coworker That You Hung Out With That One Time",
            uniqueName: "coworker",
        },
        {
            name: "David Attenborough",
            uniqueName: "attenborough",
        },
        {
            name: "Yourself",
            uniqueName: "yourself",
        },
        {
            name: "Andre Vacha",
            uniqueName: "andre-vacha",
        }
    ]
    
    console.log("MINIMAP!", data.user)
    const people = allPeople.filter(person => person.uniqueName !== data.user.uniqueName);

    const radius = 70; // Base radius for distribution
    const randomFactor = 0; // Maximum random adjustment
    
    const stars = Array.from({ length: people.length }, (_, i) => {
        const angle = (i / people.length) * 2 * Math.PI;
        const randomAdjustment = (Math.random() - 0.5) * randomFactor;
        const x = (radius + randomAdjustment) * Math.cos(angle);
        const y = (radius + randomAdjustment) * Math.sin(angle);
        return { x, y };
    });
   

    return (
        <div className={styles.minimap}>
            <AnimatePresence>
                {minimapMode.active &&
                <motion.div 
                    className={styles.innerMinimap}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    exit={{ opacity: 0 }}
                    whileHover={{ opacity: 1, scale: 1.4, x: -100, y: -100 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    >  
                    <CentralStar />
                    {people.map((person, index) => (
                        <NewStar key={index} x={stars[index].x} y={stars[index].y} person={person} />
                    ))}
                    </motion.div>
                }
            </AnimatePresence>
        </div>
    );
}

export function CentralStar() {
    const { data } = useDataContext()
    const [isHovered, setIsHovered] = useState(false);
    const editor = useEditor();
    

    const randomDelay = 0.2
    
    const ringVariants = {
        hidden: { scale: 0, x: "-50%", y: "-50%" },
        visible: (delay = 0) => ({
            scale: 1,
            x: "-50%", 
            y: "-50%",
            transition: { duration: 0.5, ease: "easeOut", delay }
        })
    };


    return (
        <>
            
            <div 
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={()=>{
                    const nameShape = editor.getShape({ id: createShapeId(data.user.uniqueName)})

                    if(nameShape){
                        editor.zoomToBounds(editor.getShapePageBounds(nameShape), {
                            animation: {
                                duration: 500,
                                easing: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
                            },
                            targetZoom: 1
                        })
                    }
                }}
            >
                <motion.div
                    className={`${styles.innerRing} nameCircle`}
                    initial="hidden"
                    animate="visible"
                    custom={0.5} // Delay for inner ring
                    variants={ringVariants}
                >
                {isHovered && (
                        <motion.div 
                            className={styles.hoverDescription}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: "linear" }}
                >
                    <p>{data.user.name}</p>
                        </motion.div>
                    )}
                </motion.div>
                <motion.div
                    className={`${styles.innerGlow} nameCircle`}
                    initial="hidden"
                    animate="visible"
                    custom={0.25} // Delay for inner glow
                    variants={ringVariants}
                />
                <motion.div
                    className={`${styles.circle} nameCircle`}
                    initial="hidden"
                    animate="visible"
                    custom={0} // No delay for circle
                    variants={ringVariants}
                />
            </div>
        </>
    );
}

export function NewStar({ x, y, person }) {
    const { data } = useDataContext();
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();
    const { setTriggerWarp, setConstellationLabel } = useStarFireSync();

    return (
        <div
            className={styles.newStar}
            style={{ transform: `translate(${x}px, ${y}px) translate(-50%, -50%)` }} // Centering adjustment
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={()=>{
                navigate(`/pitch-deck/${person.uniqueName}`, { replace: false });
                setTriggerWarp({active: true, accDuration: 1000, deaccDuration: 2000, constAccDuration: 1000}).then(() => {
                    setConstellationLabel({ visible: true, immediate: false, duration: 2, delay: 0, text: person.name })
                })
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