import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./NarratorVoice.module.css";
import { useConstellationMode } from "~/components/canvas/custom-ui/utilities/ConstellationModeContext";
import { useEditor, createShapeId } from "tldraw";
import { useStarFireSync } from "~/components/synchronization/StarFireSync";
import NarratorComponent from "./components/NarratorComponent";
import SystemComponent from "./components/SystemComponent";
import * as BABYLON from '@babylonjs/core';

export function hideAllShapes(editor){
    const pageShapes = editor.getCurrentPageShapes().filter(shape => shape.type !== 'journal');
    editor.run(() => {
        editor.updateShapes(pageShapes.map(shape => ({id: shape.id, isLocked: true, opacity: 0})))
    },
    { ignoreHistory: true })
    
}

export function showAllShapes(editor){
    const pageShapes = editor.getCurrentPageShapes().filter(shape => shape.type !== 'journal');

    editor.run(() => {
        editor.updateShapes(pageShapes.map(shape => ({id: shape.id, isLocked: false, opacity: 1})))
    },
    { ignoreShapeLock: true })

    const threads = pageShapes.filter(shape => shape.type === 'thread');
    editor.updateShapes(threads.map(thread => ({id: thread.id, isLocked: true})))
}


export function zoomToShape(editor, shapeId){
    if(editor){
        const shape = editor.getShape(shapeId);
        if(shape){
            editor.zoomToBounds(editor.getShapePageBounds(shape), {
                animation: {
                    duration: 300,
                    easing: t => t * t
                },
                targetZoom: 1,
            })
        }
        
    }
    
}

export function NarratorVoice() {
    const editor = useEditor();
    const {
        overlayMode, setOverlayMode, 
       
        expandConstellation, setExpandConstellation,
    } = useConstellationMode();

    const { 
        campfireView,
        setCampfireView,
        narratorEvent, setNarratorEvent, 
        cloudControls, setCloudControls,
        starControls, setStarControls,
        overlayControls, setOverlayControls,
        trueOverlayControls, setTrueOverlayControls,
        commandEvent, setCommandEvent,
        gameSystemText, setGameSystemText,
        gameNarratorText, setGameNarratorText,
        triggerWarp, setTriggerWarp,
        journalMode, setJournalMode,
        triggerEffect,
        textEvent, setTextEvent,
        constellationLabel, setConstellationLabel,
        glyphControls, setGlyphControls,
        animationEvent, setAnimationEvent,
        titleControls, setTitleControls,
        drifting, setDrifting,
        deleteStar, setDeleteStar,
        toggleContact, setToggleContact,
        portfolioControls, setPortfolioControls,
    } = useStarFireSync();

    const [narratorState, setNarratorState] = useState({ visible: false, text: '', requiresInteraction: false });
    const [systemState, setSystemState] = useState({ visible: false, text: '', requiresInteraction: false });
    const [commands, setCommands] = useState([]);
    const cancelRef = useRef({ canceled: false });


    useEffect(() => {
        setNarratorEvent('setup');
    }, [setNarratorEvent]);

    const narratorOrchestration = {
        'setup': [
            {
                type: 'callback',
                callback: () => {
                        setTrueOverlayControls({ visible: true, immediate: true})
                        setCampfireView({ active: false, immediate: true })
                        setStarControls({ visible: true, immediate: true})
                        setCloudControls({ visible: true, immediate: true})
                        setOverlayControls({ dark: true, immediate: true})
                        setTitleControls({ visible: false, immediate: true })
                        setJournalMode({ active: false, immediate: true })
                },
                // waitForCallback: true,
            },
            {
                // hardcoded jank because the promise logic isn't working for the components above
                type: 'callback',
                callback: () => {
                    return new Promise(resolve => setTimeout(resolve, 1000));
                },
                waitForCallback: true,
            },   
            {
                // hardcoded jank because the promise logic isn't working for the components above
                type: 'callback',
                callback: () => {
                    setNarratorEvent('home')
                },
            },  
        ],
        'contact': [
            {
                type: 'callback',
                callback: () => {
                    setToggleContact({ visible: true })
                },
            },
        ],
        'home': [
            {
                type: 'callback',
                callback: () => {

                    // todo: jank -- not returning completion
                    setDeleteStar({ created: true, id: createShapeId("andre-vacha") })
                    setToggleContact({ visible: false })
                    setConstellationLabel({ visible: false, immediate: false, duration: 2, delay: 0})
                    setGlyphControls({ visible: false, immediate: true, duration: 2 })
                    setJournalMode({ active: false, immediate: true })
                    setExpandConstellation({ concepts: false, excerpts: false })
                    const excerpts = editor.getCurrentPageShapes().filter(shape => shape.type === 'excerpt');
                    editor.deleteShapes(excerpts);

                    zoomToShape(editor, "andre-vacha")


                    return Promise.all([
                        setPortfolioControls({ visible: false }),
                        setTrueOverlayControls({ visible: false, immediate: false, duration: 5}),
                        // setTitleControls({ visible: true, immediate: false, duration: 1.3, delay: 0.3 }),
                        setOverlayControls({ dark: true, immediate: false, duration: 2, delay: 0}),
                        setTextEvent({ type: 'system', visible: false, overlay: false }),
                        setDrifting({active: false }),
                    ])
                    
                },
                waitForCallback: true,
            },
            
        ],
        'elevator-pitch': [
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setTitleControls({ visible: false, immediate: false, duration: 2, delay: 0, })
                    ])
                },
                waitForCallback: true,
            },
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setJournalMode({ active: true, variant: 'modern', page: 'elevator-pitch' })
                    ])
                },
            }
        ],
        'design-philosophy': [
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setTextEvent({
                            type: 'system',
                            visible: false,
                            overlay: false,
                        }),
                    ])
                },
                waitForCallback: true,
            },
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setTitleControls({ visible: false, immediate: false, duration: 1, delay: 0}),
                        setTextEvent({ 
                            type: 'narrator',
                            visible: true,
                            overlay: false,
                            text: "The best way to understand my design philosophy is to explore my work.", 
                            requiresInteraction: true, 
                            darkeningVisible: true, 
                        }),
                        setConstellationLabel({ 
                            visible: true, 
                            immediate: false, 
                            duration: 2, 
                            delay: 2,
                            text: "Finn's Design Philosophy for Starlight"
                        })

                    ])
                },
                waitForCallback: true,
            },
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setTextEvent({
                            type: 'narrator',
                            visible: false,
                            overlay: false,
                        })
                    ])
                },
                waitForCallback: true,
            },
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        
                        setTextEvent({ 
                            type: 'system',
                            visible: true,
                            overlay: false,
                            text: "Use the constellation to explore my design portfolio. Interact with everything to expand it! Return home using the menu in the top left.", 
                            requiresInteraction: true,
                            darkeningVisible: true,
                        })
                    ])
                },
                waitForCallback: true,
            },
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        
                        setTextEvent({ 
                            type: 'system',
                            visible: false,
                            overlay: false,
                        })
                    ])
                },
                waitForCallback: true,
            },
        ],
        'mechanics': [
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setTitleControls({ visible: false, immediate: false, duration: 1, delay: 0, }),
                    ])
                },
                waitForCallback: true,
            },
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setOverlayControls({ dark: false, immediate: false, duration: 1, delay: 0 }),
                        setTriggerWarp({ active: true, accDuration: 1000, deaccDuration: 1000, constAccDuration: 1000 }),
                    ])
                },
                waitForCallback: true,
            },
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setTextEvent({
                            type: 'system',
                            visible: true,
                            overlay: false,
                            textAlign: 'left',
                            text: "Starlight automatically creates portfolios from your existing work as users drop in half-finished ideas and articles, which you can them customize and develop over time. Concepts, excerpts and media are extracted from your work and then organized into a constellation, which is a dynamic web of connections between different media objects.",
                            headerText: "[1] Creating Portfolios: Constellations",
                            darkeningVisible: true,
                            requiresInteraction: true,
                        }),
                        setExpandConstellation({ concepts: true, excerpts: false }),

                    ])
                },
                waitForCallback: true,
            },
            {
                type: 'callback',
                callback: () => {
                    setExpandConstellation({ concepts: false, excerpts: false })
                    return Promise.all([
                        setTextEvent({
                            type: 'system',
                            visible: true,
                            overlay: false,
                            textAlign: 'left',
                            text: "Starlight imagines discovering the portfolios of others as traversing a galaxy of stars. As users inspect constellations, they can use an astrolabe to see excerpts and concepts from other people that are related to the idea currently in focus. Clicking on any of these will warp the user to another portfolio. In this way, users can find new ideas and people by deeply exploring the ideas that they resonate with.",
                            headerText: "[2] Traversing Portfolios: The Astrolabe",
                            darkeningVisible: true,
                            requiresInteraction: true,
                        }),
                        // setExpandConstellation({ concepts: false, excerpts: false }),
                        setDrifting({ active: true }),
                        
                       
                    ])
                },
                waitForCallback: true,
            },
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setTextEvent({
                            type: 'system',
                            visible: false,
                            overlay: false,
                        }),
                        setDrifting({ active: false }),
                        setTriggerWarp({ active: true, accDuration: 1000, deaccDuration: 1000, constAccDuration: 1000 }),
                        setConstellationLabel({ visible: true, immediate: false, duration: 2, delay: 0, text: "Covenants: an Introduction" })
                    ])
                },
                waitForCallback: true,
            },
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setTextEvent({
                            type: 'system',
                            visible: true,
                            overlay: false,
                            textAlign: 'left',
                            headerText: "[3] Understanding Others: Covenants",
                            text: "The core of Starlight is understanding the ideas of others. This is operationalized through the Covenant system. Covenants are tasks that are set on each portfolio by its creator.  For example, a very simple covenant might require highlighting three sentences from a piece of media that resonate with the viewer, while a very complex covenant might require them to write a comment analyzing one of the core themes. In short, covenants are challenges designed to make users demonstrate their understanding of the ideas of the portfolio's creator. By completing a covenant, a user receives a glyph (more on them soon), and can start to develop a relationship with that person.",
                            darkeningVisible: true,
                            requiresInteraction: true,
                        }),
                    ])
                },
                waitForCallback: true,
            },
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setGlyphControls({ visible: true, immediate: false, duration: 4 }),
                        setTextEvent({
                            type: 'system',
                            visible: true,
                            overlay: false,
                            textAlign: 'left',
                            text: "Glyphs are records of your connections with other people. You might think of them as an analog of friend requests. You receive the glyph of an individual by completing the covenant (challenge of understanding) associated with their constellation. This acts as a permanent record of their portfolio, allowing you to revisit it using your journal whenever you wish. Glyphs can be restored when you and another person interact with each other's constellations. This allows you to communicate with them at the campfire -- the beginnings of a friendship.",
                            headerText: "[4] Making Connections: Glyphs",
                            darkeningVisible: true,
                            requiresInteraction: true,
                        }),
                    ])
                },
                waitForCallback: true,
            },

            // todo: fix
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        // setGlyphControls({ visible: false, immediate: false, duration: 1 }),
                        setJournalMode({ active: true, variant: 'parchment', page: 'cover' }),
                        setTextEvent({
                            type: 'system',
                            visible: true,
                            overlay: false,
                            textAlign: 'left',
                            text: "Your journal is where you record the various glyphs and ideas that you come across in your travels, as well as track the messages that you have sent to others.",
                            headerText: "[5] Recording Your Travels: The Journal",
                            darkeningVisible: true,
                            requiresInteraction: true,
                        }),
                    ])
                },
                waitForCallback: true,
            },
            {
                type: 'callback',
                callback: () => {
                    console.log("triggered")

                    return Promise.all([
                        setTextEvent({
                            type: 'system',
                            visible: false,
                            overlay: false,
                        }),
                        setJournalMode({ active: false, variant: 'parchment', page: 'cover' }),
                      
                    ])
                },
                waitForCallback: true,
            },
            {
                type: 'callback',
                callback: () => {
                    setGlyphControls({ visible: false, immediate: false, duration: 1 })
                    return Promise.all([
                        setConstellationLabel({ visible: false, immediate: false, duration: 1 }),
                        setCampfireView({ 
                            active: true, 
                            immediate: false, 
                            useTargetPosition: true,
                            targetPosition: new BABYLON.Vector3(0.17, -3.25, 4.22),
                        }),
                    ])
                },
                waitForCallback: true,
            },
            {
                type: 'callback',
                callback: () => {
                    console.log("setting overlay text event")
                    
                    return Promise.all([
                        
                        setTextEvent({ 
                            type: 'system',
                            visible: true,
                            overlay: true,
                            text: "Travelling to the campfire...", 
                            waitUntilVisible: true,
                            darkeningVisible: true, 
                            waitCondition: () => {
                                return Promise.all([
                                    setCommandEvent({
                                         eventType: 'camera-moved',
                                        props: {}
                                    })
                                ])
                            }
                        })
                    ])
                },
                waitForCallback: true,
            },
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setCommandEvent({
                            eventType: 'mesh-visible', 
                            props: {
                                meshName: 'narrator'
                            }
                            })
                    ])
                },
                waitForCallback: true,
            },
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setAnimationEvent({ 
                            animationGroupName: 'looking-down',
                            props: {
                                reverse: true,
                                 startFrame: 300,  
                                endFrame: 10,
                                speed: 0.5,          
                            }
                        }),
                        setTextEvent({ 
                            type: 'narrator',
                            visible: true,
                            overlay: true,
                            text: "The campfire is a space in a redwood grove where users can interact directly with each other, leaving messages or chatting in real time once they have demonstrated their understanding of each other's ideas. It's also the refuge of the narrator, who introduces players to the world and keeps track of their progress as they restore glyphs and explore the galaxy.", 
                            delay: 1.5,
                            requiresInteraction: true,
                            darkeningVisible: true, 
                        })
                    ])
                },
                waitForCallback: true,
            },
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setCampfireView({ active: false, immediate: false, duration: 1 }),
                        setTextEvent({ 
                            type: 'system',
                            visible: false,
                            overlay: true,
                        }),
                    ])
                },
                waitForCallback: true,
            },  
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setOverlayControls({ dark: true, immediate: false, duration: 1, delay: 0 }),
                        setTitleControls({ visible: true, immediate: false, duration: 1.3, delay: 0.3 }),
                    ])
                },
                waitForCallback: true,
            },  
            {
                type: 'callback',
                callback: () => {
                    setNarratorEvent('pitch')
                },
            },      
        ],
        'technical-foundations': [
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setTitleControls({ visible: false, immediate: false, duration: 1, delay: 0, })
                    ])
                },
                waitForCallback: true,
            },
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setGlyphControls({ visible: true, immediate: false, duration: 4 })
                    ])
                },
                waitForCallback: true,
            },
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setJournalMode({ active: true, variant: 'modern', page: 'technical-foundations' })
                    ])
                },
            }
        ],
        'justification': [
            // todo: this is a super janky flow, but for some reason it prevents command leak
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setTextEvent({
                            type: 'system',
                            visible: false,
                            overlay: false,
                        }),
                    ])
                },
                waitForCallback: true,
            },
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setTitleControls({ visible: false, immediate: false, duration: 1, delay: 0, }),
                        setTextEvent({ 
                            type: 'narrator',
                            visible: true,
                            overlay: false,
                            text: "The internet can feel cold, desolate.", 
                            requiresInteraction: true, 
                            darkeningVisible: true, 
                        })
                    ])
                },
                waitForCallback: true,
            },
            // {
            //     type: 'callback',
            //     callback: () => {
            //         return Promise.all([
            //             setTextEvent({ 
            //                 type: 'narrator',
            //                 visible: true,
            //                 overlay: false,
            //                 text: "The internet can feel cold, desolate.", 
            //                 requiresInteraction: true, 
            //                 darkeningVisible: true, 
            //             })
            //         ])
            //     },
            //     waitForCallback: true,
            // },
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setTextEvent({ 
                            type: 'narrator',
                            visible: true,
                            overlay: false,
                            text: "Billions of others, calling out at such a pitch and volume that it registers only as a stabbing silence.", 
                            requiresInteraction: true, 
                            darkeningVisible: true, 
                        })
                    ])
                },
                waitForCallback: true,
            },
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setTextEvent({ 
                            type: 'narrator',
                            visible: true,
                            overlay: false,
                            text: "I have spent much of my life here, and I can count on one hand the number of friends that I have made. With each day, it often feels that it gets harder to focus, to remember, to feel. I become less of myself.", 
                            requiresInteraction: true, 
                            darkeningVisible: true, 
                        })
                    ])
                },
                waitForCallback: true,
            },
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setTextEvent({ 
                            type: 'narrator',
                            visible: true,
                            overlay: false,
                            text: "These are twinned problems. Connection to others allows us to cultivate a connection to ourselves. A connection to ourselves forges us into the type of person capable of connecting with others. I do not believe that these are problems to be addressed with willpower alone, or through the cauterization of the online. I also do not believe they can be addressed with our current paradigm of software.", 
                            requiresInteraction: true, 
                            darkeningVisible: true, 
                        })
                    ])
                },
                waitForCallback: true,
            },
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setTextEvent({ 
                            type: 'narrator',
                            visible: true,
                            overlay: false,
                            text: "So where have we fallen short? Are our interfaces inhumane? Are our interaction patterns unsatisfying? Are our workflows inefficient? Have we failed to optimize enough?", 
                            requiresInteraction: true, 
                            darkeningVisible: true, 
                        })
                    ])
                },
                waitForCallback: true,
            },
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setTextEvent({ 
                            type: 'narrator',
                            visible: true,
                            overlay: false,
                            text: "No.", 
                            requiresInteraction: true, 
                            darkeningVisible: true, 
                        })
                    ])
                },
                waitForCallback: true,
            },
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setTextEvent({ 
                            type: 'narrator',
                            visible: true,
                            overlay: false,
                            text: "We have optimized far, far too much. In our attempts to make our lives more efficient, I believe that we have stripped from software the characteristics that would bring more joy to our unavoidably online days: beauty, wonder, challenge, narrative, catharsis.", 
                            requiresInteraction: true, 
                            darkeningVisible: true, 
                        })
                    ])
                },
                waitForCallback: true,
            },
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setTextEvent({ 
                            type: 'narrator',
                            visible: true,
                            overlay: false,
                            text: "These are the primitives of game design. Starlight is my first, fledgling attempt to weave them into what we might otherwise consider “software”: code that serves some practical purpose in the real world.", 
                            requiresInteraction: true, 
                            darkeningVisible: true, 
                        })
                    ])
                },
                waitForCallback: true,
            },
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setTextEvent({ 
                            type: 'narrator',
                            visible: true,
                            overlay: false,
                            text: "Starlight is more important to me than its function. It represents a philosophy, a promise that I wish to fulfil:",
                            requiresInteraction: true, 
                            darkeningVisible: true, 
                        })
                    ])
                },
                waitForCallback: true,
            },
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setTextEvent({ 
                            type: 'narrator',
                            visible: true,
                            overlay: false,
                            text: "amidst a million systems crushing us into cold automata, at least a few of the the tools that we use should cultivate both focus and joy.", 
                            requiresInteraction: true, 
                            darkeningVisible: true, 
                        })
                    ])
                },
                waitForCallback: true,
            },
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setTextEvent({ 
                            type: 'narrator',
                            visible: false,
                            overlay: false,
                        })
                    ])
                },
                waitForCallback: true,
            },
            {
                type: 'callback',
                callback: () => {
                    setNarratorEvent('home')
                },
                waitForCallback: false,
            },
            
        ],
        'pitch': [
            // setup - before title drop
            // {
            //     type: 'callback',
            //     callback: () => {
            //             setTrueOverlayControls({ visible: true, immediate: true})
            //             setCampfireView({ active: false, immediate: true })
            //             setStarControls({ visible: true, immediate: true})
            //             setCloudControls({ visible: true, immediate: true})
            //             setOverlayControls({ dark: true, immediate: true})
            //             setTitleControls({ visible: false, immediate: true })
            //             setJournalMode({ active: false, immediate: true })
            //     },
            //     // waitForCallback: true,
            // },
            // {
            //     // hardcoded jank because the promise logic isn't working for the components above
            //     type: 'callback',
            //     callback: () => {
            //         return new Promise(resolve => setTimeout(resolve, 1000));
            //     },
            //     waitForCallback: true,
            // },   
            {
                type: 'callback',
                callback: () => {

                    // todo: jank -- not returning completion
                    setConstellationLabel({ visible: false, immediate: false, duration: 2, delay: 0})
                    setGlyphControls({ visible: false, immediate: false, duration: 2 })
                    setJournalMode({ active: false, immediate: true })


                    return Promise.all([
                        setTrueOverlayControls({ visible: false, immediate: false, duration: 3}),
                        setTitleControls({ visible: true, immediate: false, duration: 1.3, delay: 0.3 }),

                        setOverlayControls({ dark: true, immediate: false, duration: 2, delay: 0}),
                        setTextEvent({ type: 'system', visible: false, overlay: false }),
                        setDrifting({active: false }),
                    ])
                    
                },
                waitForCallback: true,
            },
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setStarControls({ visible: false, immediate: false, duration: 0.5 }),
                        setTitleControls({ visible: false, immediate: false, duration: 1 })
                    ])
                    
                },
                waitForCallback: true,
            },
            // {
            //     type: 'callback',
            //     callback: () => {
            //         setCampfireView({ active: false, immediate: true })
            //         setConstellationLabel({ visible: false, immediate: true })
            //         setOverlayControls({ dark: true, immediate: true })
            //         setStarControls({ visible: false, immediate: true })
            //         setCloudControls({ visible: true, immediate: true })
            //     }
            // },
            // {
            //     // hardcoded jank because the promise logic isn't working for the components above
            //     type: 'callback',
            //     callback: () => {
            //         return new Promise(resolve => setTimeout(resolve, 200000));
            //     },
            //     waitForCallback: true,
            // },     
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setTextEvent({ 
                            type: 'narrator',
                            visible: true,
                            overlay: false,
                            text: "This can be a cold and desolate place.", 
                            requiresInteraction: true, 
                            darkeningVisible: false, 
                        })
                    ])
                },
                waitForCallback: true,
            }, 
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setTextEvent({ 
                            type: 'narrator',
                            visible: true,
                            overlay: false,
                            text: "We have spent much of our lives here. Lost in a stupor, adrift in a void,", 
                            requiresInteraction: true, 
                            darkeningVisible: false
                        })
                    ])
                },
                waitForCallback: true,
            }, 
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setTextEvent({ 
                            type: 'narrator',
                            visible: true,
                            overlay: false,
                            text: "flitting between cold ideas.", 
                            requiresInteraction: true, 
                            darkeningVisible: false, 
                        })
                    ])
                },
                waitForCallback: true,
            }, 
            {
                type: 'callback',
                callback: () => {
                    setStarControls({ visible: true, immediate: false, duration: 4 })
                }
            },
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setTextEvent({ 
                            type: 'narrator',
                            visible: true,
                            overlay: false,

                            text: "Now that you have returned to me, I wish to try building something better.", 
                            requiresInteraction: true, 
                            darkeningVisible: true,
                            darkeningDuration: 2, 
                        })
                    ])
                },
                waitForCallback: true,
            }, 
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setTextEvent({ 
                            type: 'narrator',
                            visible: true,
                            overlay: false,
                            text: "It has been so very long since you were awake", 
                            requiresInteraction: true, 
                            waitUntilVisible: false,
                            darkeningVisible: true, 
                        })
                    ])
                },
                waitForCallback: true,
            },
            {
                type: 'callback',
                callback: () => {
                    console.log('fade narrator event')
                    return Promise.all([
                        setTextEvent({ 
                            type: 'narrator',
                            overlay: false,
                            visible: false,
                            
                           
                        })
                    ])
                },
                waitForCallback: true,
            },
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setTrueOverlayControls({ visible: true, immediate: false, duration: 4 }),
                    ])
                },
                waitForCallback: true,
            },
            {
                type: 'callback',
                callback: () => {
                    console.warn("campfire view callback")
                        setCampfireView({ 
                            active: true, 
                            immediate: true, 
                            useTargetPosition: true,
                            targetMeshName: 'ground',
                            targetPosition: new BABYLON.Vector3(0.17, -3.25, 4.22),
                         }),
                        setStarControls({ visible: true, immediate: true })
                },
            },
            {
                type: 'callback',
                callback: () => {
                    console.warn("overlay fade out callback")
                    return Promise.all([
                        setTrueOverlayControls({ visible: false, immediate: false, duration: 4 }),
                        setOverlayControls({ dark: false, immediate: false, duration: 1, delay: 0 }),
                    ])
                },
                waitForCallback: true,
            },
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        
                        setTextEvent({ 
                            type: 'system',
                            visible: true,
                            overlay: true,
                            text: "Try looking up", 
                            waitUntilVisible: true,
                            darkeningVisible: true, 
                            waitCondition: () => {
                                return Promise.all([
                                    setCommandEvent({
                                         eventType: 'camera-moved',
                                        props: {}
                                    })
                                ])
                            }
                        })
                    ])
                },
                waitForCallback: true,
            }, 
            {
                type: 'callback',
                callback: () => {
                    console.log('triggered')
                    return Promise.all([
                        setTextEvent({ 
                            type: 'system',
                            overlay: true,
                            visible: false,
                            
                           
                        })
                    ])
                },
                waitForCallback: false,
            },
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setCommandEvent({
                            eventType: 'mesh-visible', 
                            props: {
                                meshName: 'narrator'
                            }
                            })
                    ])
                },
                waitForCallback: true,
            },
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setAnimationEvent({ 
                            animationGroupName: 'looking-down',
                            props: {
                                reverse: true,
                                startFrame: 300,  
                                endFrame: 10,
                                speed: 0.5,          
                            }
                        }),
                        setTextEvent({ 
                            type: 'narrator',
                            visible: true,
                            overlay: true,
                            text: "So long spent in the dark sky - do you even remember what the stars look like?", 
                            duration: 10,
                            delay: 1.5,
                            requiresInteraction: false,
                            waitUntilVisible: true,
                            darkeningVisible: true, 
                        })
                    ])
                },
                waitForCallback: true,
            }, 
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setCampfireView({ active: false, immediate: false }),
                        setTextEvent({ 
                            type: 'narrator',
                            visible: false,
                            overlay: true,
                        })
                    ])
                },
                waitForCallback: true,
            }, 
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        
                        setConstellationLabel({ 
                            visible: true, 
                            immediate: false, 
                            duration: 2, 
                            delay: 0,
                            text: "The First Star"
                        }),
                        
                    ])
                },
                waitForCallback: true,
            },
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setExpandConstellation({ concepts: true, excerpts: true }),
                        setTextEvent({ 
                            type: 'system',
                            visible: true,
                            overlay: false,
                            text: "create constellations to explore your work", 
                            requiresInteraction: true, 
                            delay: 2,
                        }),
                    ])
                },
                waitForCallback: true,
            },
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setTriggerWarp({ active: true, accDuration: 1000, deaccDuration: 1000, constAccDuration: 1000 }).then(()=>{
                        setConstellationLabel({ 
                            visible: true, 
                            immediate: false, 
                            duration: 2, 
                            delay: 2,
                            text: "Finn's Cluster"
                        })
                        }),
                        setTextEvent({ 
                            type: 'system',
                            visible: true,
                            overlay: false,
                            text: "traverse the stars to discover new ideas", 
                            requiresInteraction: true, 
                            delay: 2,
                        })
                    ])
                },
                waitForCallback: true,
            },
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setTextEvent({ 
                            type: 'system',
                            visible: true,
                            overlay: false,
                            text: "collect glyphs to forge new friendships", 
                            requiresInteraction: true, 
                            delay: 2
                        }),
                        setGlyphControls({ visible: true, immediate: false, duration: 4 })
                    ])
                },
                waitForCallback: true,
            },
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setGlyphControls({ visible: false, immediate: false, duration: 4 }),
                        setTextEvent({ 
                            type: 'system',
                            visible: false,
                            overlay: false,
                        }),
                        setJournalMode({ active: true, page: 'pitch' })

                    ])
                },
                waitForCallback: true,
            },
        ],
        'conceptual-pitch': [
            {
                type: 'callback',
                callback: () => {
                    
                    setTitleControls({ visible: false, immediate: false, duration: 1, delay: 0, })
                    setStarControls({ visible: false, immediate: false, duration: 0.5 })
                },
            },
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setDeleteStar({ deleted: true, id: createShapeId("andre-vacha") }),
                        setTextEvent({ 
                            type: 'system',
                            visible: true,
                            overlay: false,
                            text: "These are portfolios: collections of ideas, records of part of a person.", 
                            requiresInteraction: true, 
                            darkeningVisible: false, 
                        }),
                        setPortfolioControls({ visible: true })
                    ])
                },
                waitForCallback: true,
            }, 
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setTextEvent({ 
                            type: 'system',
                            visible: true,
                            overlay: false,
                            text: "Portfolios are important because they are the vehicle through which we share our thinking. Through them, we refine our ideas, find others who resonate with us, define who we are.", 
                            requiresInteraction: true, 
                            darkeningVisible: false, 
                        })
                    ])
                },
                waitForCallback: true,
            }, 
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setTextEvent({ 
                            type: 'system',
                            visible: true,
                            overlay: false,
                            text: "These portfolios are quite bad at achieving their ends:they requires a significant amount of effort and technical & design skill to make compelling, they are static and boring to navigate, and very rarely do they foster connection, wasting away on some isolated corner of the internet.", 
                            requiresInteraction: true, 
                            darkeningVisible: false, 
                        })
                    ])
                },
                waitForCallback: true,
            },
            {
                type: 'callback',
                callback: () => {
                    setStarControls({ visible: true, immediate: false, duration: 4 })
                    
                    setDeleteStar({ created: true, id: createShapeId("andre-vacha") })

                    return Promise.all([
                        setPortfolioControls({ visible: false }),
                        setTextEvent({
                            type: 'system',
                            visible: false,
                            overlay: false,
                        })
                    ])
                },
                waitForCallback: true,
            },
            {
                type: 'callback',
                callback: () => {
                    
                    return Promise.all([
                        setTextEvent({ 
                            type: 'narrator',
                            visible: true,
                            overlay: false,
                            text: "This is also a portfolio, reimagined using the principles of game design.", 
                            requiresInteraction: true, 
                            darkeningVisible: true, 
                        })
                    ])
                },
                waitForCallback: true,
            }, 
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setExpandConstellation({ concepts: true, excerpts: false }),
                        setTextEvent({ 
                            type: 'narrator',
                            visible: true,
                            overlay: false,
                            text: "It is designed to be beautiful to explore and navigate through, to be a vehicle through which you might understand your own ideas, to be the anchor for deep connection with others based on a mutual understanding of each other’s ideas. Try interacting with it.", 
                            requiresInteraction: true, 
                            darkeningVisible: true, 
                            delay: 2,
                        })
                    ])
                },
                waitForCallback: true,
            },
            {
                type: 'callback',
                callback: () => {
                    console.log('fade narrator event')
                    return Promise.all([
                        setTextEvent({ 
                            type: 'narrator',
                            overlay: false,
                            visible: false,
                            
                           
                        })
                    ])
                },
                waitForCallback: true,
            },
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setTrueOverlayControls({ visible: true, immediate: false, duration: 3 }),
                    ])
                },
                waitForCallback: true,
            },
            {
                type: 'callback',
                callback: () => {
                    console.warn("campfire view callback")
                    setCampfireView({ 
                        active: true, 
                        immediate: true, 
                        useTargetPosition: true,
                        targetMeshName: 'ground',
                        targetPosition: new BABYLON.Vector3(0.17, -3.25, 4.22),
                        })
                    setExpandConstellation({ concepts: false, excerpts: false })
                }
            },
            {
                type: 'callback',
                callback: () => {
                    console.warn("overlay fade out callback")
                    return Promise.all([
                        setTrueOverlayControls({ visible: false, immediate: false, duration: 3 }),
                    ])
                },
                waitForCallback: true,
            },
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        
                        setTextEvent({ 
                            type: 'system',
                            visible: true,
                            overlay: true,
                            text: "Try looking up", 
                            waitUntilVisible: true,
                            darkeningVisible: true, 
                            waitCondition: () => {
                                return Promise.all([
                                    setCommandEvent({
                                         eventType: 'camera-moved',
                                        props: {}
                                    })
                                ])
                            }
                        })
                    ])
                },
                waitForCallback: true,
            }, 
            {
                type: 'callback',
                callback: () => {
                    console.log('triggered')
                    return Promise.all([
                        setTextEvent({ 
                            type: 'system',
                            overlay: true,
                            visible: false,
                            
                           
                        })
                    ])
                },
                waitForCallback: false,
            },
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setCommandEvent({
                            eventType: 'mesh-visible', 
                            props: {
                                meshName: 'narrator'
                            }
                            })
                    ])
                },
                waitForCallback: true,
            },
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setAnimationEvent({ 
                            animationGroupName: 'looking-down',
                            props: {
                                reverse: true,
                                startFrame: 300,  
                                endFrame: 10,
                                speed: 0.5,          
                            }
                        }),
                        setTextEvent({ 
                            type: 'narrator',
                            visible: true,
                            overlay: true,
                            text: "This, too, might be considered a portfolio: a representation of a person that you can interact with in natural language, one that leverages the immersive qualities of a game to encourage empathetic communication.", 
                            requiresInteraction: true, 
                            darkeningVisible: true, 
                        })
                    ])
                },
                waitForCallback: true,
            }, 
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setCampfireView({ active: false, immediate: false }),
                        setTextEvent({ 
                            type: 'narrator',
                            visible: false,
                            overlay: true,
                        })
                    ])
                },
                waitForCallback: true,
            },
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        
                        setConstellationLabel({ 
                            visible: true, 
                            immediate: false, 
                            duration: 2, 
                            delay: 0,
                            text: "The First Star: Your Own Work"
                        }),
                        
                    ])
                },
                waitForCallback: true,
            },

            {
                type: 'callback',
                callback: () => {
                                            
                    setConstellationLabel({ 
                        visible: false, 
                        immediate: false, 
                        duration: 1, 
                        delay: 0,
                    })

                    return Promise.all([
                        setTextEvent({ 
                            type: 'system',
                            visible: true,
                            overlay: false,
                            headerText: "create constellations to explore your work",
                            text: "constellations are dynamically constructed, interactive portfolios that organise your media using common concepts found across them", 
                            requiresInteraction: true, 
                            darkeningVisible: true, 
                        }),
                        setExpandConstellation({ concepts: true, excerpts: false })
                    ])
                },
                waitForCallback: true,
            }, 
            
            {
                type: 'callback',
                callback: () => {
                    setDrifting({ active: true })
                    return Promise.all([
                        setTriggerWarp({ active: true, accDuration: 1000, deaccDuration: 1000, constAccDuration: 1000 }).then(()=>{
                            setConstellationLabel({ 
                                visible: true, 
                                immediate: false, 
                                duration: 2, 
                                delay: 2,
                                text: "Finn's Cluster"
                            })
                        }),
                        setTextEvent({ 
                            type: 'system',
                            visible: true,
                            overlay: false,
                            headerText: "traverse the stars to discover new ideas",
                            text: "constellations are linked together based on the similarity of their ideas. users traverse the galaxy to find new ideas and connections", 
                            requiresInteraction: true, 
                            darkeningVisible: true, 
                        })
                    ])
                },
                waitForCallback: true,
            }, 
            {
                type: 'callback',
                callback: () => {
                    setDrifting({ active: false })
                    return Promise.all([
                        setGlyphControls({ visible: true, immediate: false, duration: 4 }),
                        setOverlayControls({ dark: false, immediate: false, duration: 2, delay: 0}),
                        setTextEvent({ 
                            type: 'system',
                            visible: true,
                            overlay: false,
                            headerText: "collect glyphs to forge new friendships",
                            text: "interacting with the constellation of another gifts you a glyph: a record of their ideas. Gather glyphs to connect with others and uncover lost skills in traversal, research and star-weaving as you develop your own constellation alongside a community of others", 
                            requiresInteraction: true, 
                            darkeningVisible: true, 
                        })
                    ])
                },
                waitForCallback: true,
            }, 
            {
                type: 'callback',
                callback: () => {
                    return Promise.all([
                        setGlyphControls({ visible: false, immediate: false, duration: 4 }),
                        setTextEvent({ 
                            type: 'system',
                            visible: false,
                            overlay: false,
                        }),
                        setJournalMode({ active: true, variant: 'parchment', page: 'pitch' }),

                    ])
                },
                waitForCallback: true,
            },
        ]
    };

    const executeCommands = (commands, index) => {
    
        if(index >= commands.length){
            return;
        }

        const command = commands[index];

        console.log("COMMANDS", commands)
        console.log("COMMAND", command)
        console.log("COMMAND INDEX:", index)
    
        if (command.type === "callback") {
            setNarratorState({ visible: false, text: '', requiresInteraction: false });
            setSystemState({ visible: false, text: '', requiresInteraction: false });
            setGameNarratorText({ visible: false, text: '', requiresInteraction: false });
            setGameSystemText({ visible: false, text: '', requiresInteraction: false });


            if(false && command.waitForCondition){
                const checkCondition = () => {
                    if (command.waitForCondition()) {
                        if(command.waitForCallback){
                            command.callback().then(() => {
                                executeCommands(commands, index + 1);
                            });
                        } else {
                            executeCommands(commands, index + 1);
                        }
                    } else {
                        setTimeout(checkCondition, 200);
                    }
                };
                checkCondition();
            }
            else {
                if (command.waitForCallback) {
                    command.callback().then(() => {
                        executeCommands(commands, index + 1);
                    });
                } else {
                    command.callback();
                        executeCommands(commands, index + 1);
                }
            } 
            }
            else {
                console.error("Unknown command type:", command.type);
            }   
    };

    useEffect(() => {
        if (narratorEvent && narratorOrchestration[narratorEvent]) {
            setCommands(narratorOrchestration[narratorEvent]);
            executeCommands(narratorOrchestration[narratorEvent], 0);
        }
    }, [narratorEvent]);

    return (
        <>
            <NarratorComponent 
                visible={narratorState.visible} 
                text={narratorState.text} 
                requiresInteraction={narratorState.requiresInteraction}
                exitDuration={narratorState.exitDuration}
                darkeningVisible={narratorState.darkeningVisible}
                darkeningDuration={narratorState.darkeningDuration}
                />
            <SystemComponent 
                visible={systemState.visible} 
                text={systemState.text} 
                requiresInteraction={systemState.requiresInteraction}
                onComplete={systemState.onComplete}
                />
        </>
    );
}