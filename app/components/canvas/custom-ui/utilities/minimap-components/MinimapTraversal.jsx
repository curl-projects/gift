import { useParams, useNavigate } from '@remix-run/react';
import { useState, useEffect } from 'react';
import styles from './MinimapTraversal.module.css';
import { useStarFireSync } from '~/components/synchronization/StarFireSync';
import { motion } from 'framer-motion';
import { englishToLepchaMap } from '~/components/canvas/helpers/language-funcs';
import { Tldraw, createShapeId } from 'tldraw';
import { MinimapStarShapeUtil } from './minimap-shapes/MinimapStarShapeUtil';

export function MinimapTraversal(){

    const components = {
        Toolbar: null,
        MainMenu: null,
        DebugMenu: null,
        DebugPanel: null,
        Minimap: null,
        PageMenu: null,
        ActionsMenu: null,
        ZoomMenu: null,
        QuickActions: null,
        NavigationPanel: null,
        HelpMenu: null,
        ContextMenu: null,
        StylePanel: null,
        SharePanel: null,
    }

    const shapeUtils = [MinimapStarShapeUtil]



    // approach:
    // if the concepts are expanded or they're drifting, show new people
    // if a concept is focused, show related concepts
    // if an excerpt is focused, show related excerpts
    const { minimapMode } = useStarFireSync();
    const { person: activePerson } = useParams();
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

    // Assign positions to each person, placing the active person at the center
    const stars = people.map((person, index) => {
        const isActive = person.uniqueName === activePerson;
        const position = isActive ? { x: 0, y: 0 } : starPositions[index % starPositions.length];
        return { ...position, person };
    });

    const activeScale = (minimapMode.expanded ? minimapMode.expandedScale :
                        minimapMode.hovered ? minimapMode.hoveredScale :
                        1
                    )

    return(
        <div 
            className={`${styles.traversalContainer} minimap-canvas-container`}
            style={{
                transform: `scale(${1/activeScale})`, // counterscale to preserve canvas
                border: "2px solid pink",
                height: `${activeScale*100}%`,
                minWidth: `${activeScale*100}%`,
            }}
        >

        <Tldraw
            autofocus={false}
            readOnly={true}
            shapeUtils={shapeUtils}
            className="minimap-canvas"
            components={components}
            onMount={(editor) => {
               const starId = createShapeId('minimapStar');
               editor.createShape({
                id: starId,
                type: 'minimapStar',
                    props: {
                        person: {
                            name: "A Complete Stranger",
                            uniqueName: "stranger"
                        },
                        isActive: false
                    }
               })
            }}
        />

        {/* {
          stars.map((star, index) => (
            <NewStar
                key={index}
                x={star.x}
                y={star.y}
                person={star.person}
                isActive={star.person.uniqueName === activePerson}
                />  
        ))} */}
        
        </div>
    )
}