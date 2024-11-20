import styles from './ConceptListPainter.module.css'
import { useStarFireSync } from "~/components/synchronization/StarFireSync"
import { useEffect, useState, useRef } from "react"
import { useEditor, track } from "tldraw"
import { animateShapeProperties } from "~/components/canvas/helpers/animation-funcs"
import { useCollection } from "~/components/canvas/custom-ui/collections";
import { motion, AnimatePresence } from "framer-motion";

export const ConceptListPainter = track(() => {
    const { conceptList } = useStarFireSync()
    const editor = useEditor()
    const { collection } = useCollection('graph')
    const [originalPositions, setOriginalPositions] = useState({})
    const prevActiveRef = useRef(conceptList.active)
    const animationRef = useRef(null) // To store animation frame ID
    const conceptsRef = useRef([]) // To store concepts
    const animTime = 300 // Animation duration in milliseconds


    const yOffset = 135

    useEffect(() => {
        console.log("CONCEPT LIST ACTIVE:", conceptList)

        const prevActive = prevActiveRef.current

        if (conceptList.active) {
            // Move concepts
            const concepts = editor.getCurrentPageShapes().filter(shape => shape.type === 'concept')
 
            // Store original positions
            const positions = {}
            concepts.forEach(concept => {
                positions[concept.id] = { x: concept.x, y: concept.y }
            })
            !prevActive && setOriginalPositions(positions)
            conceptsRef.current = concepts // Store concepts for later use

            // Animate their positions
            console.log("CONCEPTS:", concepts)
            editor.setSelectedShapes(concepts.map(c => c.id))

            // Start animating to target positions
            animateToPositions()
        } else if (!conceptList.active) {
            console.log("CLOSING CONCEPT LIST")
            // Move the concepts back to where they were before
            const concepts = editor.getCurrentPageShapes().filter(shape => shape.type === 'concept')
            editor.setSelectedShapes(concepts.map(c => c.id))
            concepts.forEach(concept => {
                const originalPosition = originalPositions[concept.id]
                if (originalPosition) {
                    animateShapeProperties(editor, concept.id, originalPosition, 300, t => t * t).then(()=>{
                        editor.setSelectedShapes([])
                    })
                }
            })
            // Cancel any ongoing animation frame updates
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
                animationRef.current = null
            }
        }

        prevActiveRef.current = conceptList.active
    }, [conceptList])

    const animateToPositions = () => {
        const concepts = conceptsRef.current

        // Define verticalSpacing in screen pixels
        const verticalSpacingScreen = 30 // Adjust this value for desired spacing in screen pixels

        // Get starting position in screen coordinates
        const pageHeight = window.innerHeight
        const startXScreen = 20
        const startYScreen = pageHeight - yOffset

        // Convert starting position to page coordinates
        const pageCoords = editor.screenToPage({ x: startXScreen, y: startYScreen })

        // Convert verticalSpacing from screen pixels to page units
        const pointA = editor.screenToPage({ x: 0, y: 0 })
        const pointB = editor.screenToPage({ x: 0, y: verticalSpacingScreen })
        const verticalSpacingPage = pointB.y - pointA.y

        concepts.forEach((concept, index) => {
            const targetX = pageCoords.x
            const targetY = pageCoords.y - index * verticalSpacingPage // Move up instead of down

            // Use the animateShapeProperties function
            animateShapeProperties(editor, concept.id, { x: targetX, y: targetY }, animTime, (t) => t * (2 - t))
        })

        // Start updating shapes after animation completes
        setTimeout(() => {
            const updateShapes = () => {
                // Recalculate positions every frame

                // Update starting position in case of screen changes
                const pageHeight = window.innerHeight
                const startXScreen = 20
                const startYScreen = pageHeight - yOffset
                const pageCoords = editor.screenToPage({ x: startXScreen, y: startYScreen })

                // Recalculate verticalSpacing in case of zoom changes
                const pointA = editor.screenToPage({ x: 0, y: 0 })
                const pointB = editor.screenToPage({ x: 0, y: verticalSpacingScreen })
                const verticalSpacingPage = pointB.y - pointA.y

                conceptsRef.current.forEach((concept, index) => {
                    const targetX = pageCoords.x
                    const targetY = pageCoords.y - index * verticalSpacingPage

                    editor.updateShapes([{
                        id: concept.id,
                        type: concept.type,
                        x: targetX,
                        y: targetY,
                    }])
                })

                animationRef.current = requestAnimationFrame(updateShapes)
            }
            updateShapes()
        }, animTime)
    }

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
        }
    }, [])

    return (
        <div className={styles.conceptListPainter}>
            <AnimatePresence>
                {conceptList.active && conceptList.focusedConcept &&
                    <motion.p
                        key={conceptList.focusedConcept}
                        className={styles.painterText}
                        initial={{ opacity: 0}}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                    >
                        {editor.getShape(conceptList.focusedConcept).props.plainText}
                    </motion.p>
                }
            </AnimatePresence>
        </div>
    )
})