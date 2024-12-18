import {
	BaseBoxShapeUtil,
	Geometry2d,
	Rectangle2d,
	TLBaseShape,
	HTMLContainer,
	stopEventPropagation,
} from '@tldraw/editor'
import { T, createShapeId } from 'tldraw';
import { useCallback, useState, useEffect, useRef, useLayoutEffect } from 'react'
import { useDataContext } from '~/components/synchronization/DataContext';
import styles from './NameShapeUtil.module.css';
import { motion, useAnimate, AnimatePresence } from 'framer-motion';
import { conceptsExist, generateConcepts, generateConceptLinks } from "~/components/canvas/helpers/thread-funcs"
import { useCollection } from "~/components/canvas/custom-ui/collections";
import { animateShapeProperties } from "~/components/canvas/helpers/animation-funcs"
import { deleteAssociatedThreads } from "~/components/canvas/helpers/thread-funcs"
import { useConstellationMode } from '~/components/canvas/custom-ui/utilities/ConstellationModeContext';
import { useStarFireSync } from '~/components/synchronization/StarFireSync';
import { ConstellationMetadata } from '~/components/canvas/custom-ui/utilities/ConstellationLabelPainter';

const nameShapeProps = {
	w: T.number,
	h: T.number,
	name: T.string,
    expanded: T.boolean,
}

type NameShape = TLBaseShape<
	'name',
	{
		w: number
		h: number
        name: string
        expanded: boolean
	}
>

/** @public */
export class NameShapeUtil extends BaseBoxShapeUtil<NameShape> {
	static override type = 'name' as const
	static override props = nameShapeProps

	override canEdit = () => true
    override hideResizeHandles = () => true
    override hideRotateHandle = () => true
	override canResize = () => false

    override hideSelectionBoundsBg = () => true
    override hideSelectionBoundsFg = () => true
    


	getDefaultProps(): NameShape['props'] {
		return { 
			w: 200,
			h: 20,
			name: "AV",
            expanded: false,
		}
	}

	getGeometry(shape: NameShape): Geometry2d {
		return new Rectangle2d({
			width: shape.props.w,
			height: shape.props.h,
			isFilled: true,
		})
	}

	component(shape: NameShape) {
		const shapeRef = useRef();
        const [scope, animate] = useAnimate()
        const isOnlySelected = this.editor.getOnlySelectedShapeId() === shape.id;
        const [isHovered, setIsHovered] = useState(false);
        const { data } = useDataContext();
        const { collection, size } = useCollection('graph')
        const { triggerWarp, expandConcepts } = useConstellationMode();
        const { drifting, setDrifting, triggerEffect, activeEffect, deleteStar, setDeleteStar, conceptList, setConceptList } = useStarFireSync();
        

        // useEffect(()=>{
        //     console.log("SHAPE:", shape)
        //     if(triggerWarp){
        //         this.editor.updateShape({id: shape.id, type: shape.type })
        //     }
        // }, [triggerWarp])

		useEffect(()=>{
			if(shapeRef.current && shapeRef.current.clientHeight !== 0 && shapeRef.current.clientWidth !== 0){
				this.editor.updateShape({id: shape.id, type: shape.type, props: {
					w: shapeRef.current.clientWidth,
					h: shapeRef.current.clientHeight
				}})
			}
		}, [this.editor, shapeRef.current])

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
        const dashedRingVariants = {
            hidden: { scale: 0, rotate: 0, x: "-50%", y: "-50%" },
            visible: (delay = 0) => ({
                scale: 1.5, // Larger than the largest outer ring
                rotate: 360,
                x: "-50%",
                y: "-50%",
                transition: { duration: 1, ease: "easeOut", delay }
            }),
            rotate: {
                rotate: [0, 360],
                transition: { repeat: Infinity, duration: 10, ease: "linear" }
            },
            exit: {
                scale: 0,
                // rotate: [0, 360],
                x: "-50%",
                y: "-50%",
                transition: { duration: 0.3, ease: "easeIn" }
            }
        };

        const orbitingRingVariants = {
            hidden: { scale: 0, rotate: 0, x: "-50%", y: "-50%" },
            visible: (custom) => ({
                scale: 1, // Larger than the largest outer ring
                rotate: 360,
                x: "-50%",
                y: "-50%",
                transition: { duration: 1, ease: "easeOut", delay: custom.delay }
            }),
            rotate: {
                rotate: [0, 360],
                transition: { repeat: Infinity, duration: 40, ease: "linear" }
            },
            exit: {
                scale: 0,
                rotate: 0,
                x: "-50%",
                y: "-50%",
                transition: { duration: 0.2, ease: "easeIn" }
            }
        };

        useEffect(()=>{
            console.log("ACTIVE EFFECT TRIGGERED:", activeEffect, shape.id)
            if(activeEffect && 
               activeEffect.domain === "canvas" && 
               activeEffect.selector.type === "shape" && 
               activeEffect.selector.id === shape.id){
                switch(activeEffect.effect){
                    case "ripple":
                        animate(".nameCircle", { scale: 0.9 }, { duration: 0.2, ease: 'easeInOut' })
                        .then(() => animate(".nameCircle", { scale: 1.1 }, { duration: 0.2, ease: 'easeInOut' }))
                        .then(() => {
                            animate(".nameCircle", { scale: 1 }, { duration: 0.2, ease: 'easeInOut' });
                            animate(`.ripple`, { scale: [0, 8], opacity: [1, 0], x: "-50%", y: "-50%" }, { duration: 1.5, ease: "easeOut", delay: 0 });
                            if(activeEffect.callback){
                                activeEffect.callback()
                            }
                        })
                        break;
                }
            }
        }, [activeEffect])


        useEffect(() => {
            if (isOnlySelected) {
                console.log("TRIGGERING RIPPLE ANIMATION")
                // Trigger ripple animation
                animate(".nameCircle", { scale: 0.9 }, { duration: 0.2, ease: 'easeInOut' })
                    .then(() => animate(".nameCircle", { scale: 1.1 }, { duration: 0.2, ease: 'easeInOut' }))
                    .then(() => {
                        animate(".nameCircle", { scale: 1 }, { duration: 0.2, ease: 'easeInOut' });
                        animate(`.ripple`, { scale: [0, 8], opacity: [1, 0], x: "-50%", y: "-50%" }, { duration: 1.5, ease: "easeOut", delay: 0 });
                    })
            }
        }, [isOnlySelected, animate, shape]);

        useEffect(()=>{
            setTimeout(()=>{
                this.editor.updateShape({id: shape.id, type: shape.type, props: {
                    expanded: true
                }})
            }, 1500)
        }, [])


        // useEffect(()=>{
        //     if(collection && data){

        //     if(shape.props.expanded){
        //         setConceptList({active: false})
        //         this.editor.zoomToBounds(this.editor.getShapePageBounds(shape), {
        //             animation: {
        //                 duration: 300,
        //                 ease: "easeInOut"
        //             },
        //             targetZoom: 1,
        //         });

        //         animate(".nameCircle", { scale: 0.8 }, { duration: 0.2, ease: 'easeInOut' })
        //         .then(() => animate(".nameCircle", { scale: 1.2 }, { duration: 0.2, ease: 'easeInOut' }))
        //         .then(() => {
        //             animate(".nameCircle", { scale: 1 }, { duration: 0.2, ease: 'easeInOut' });
        //             animate(`.ripple`, { scale: [0, 8], opacity: [1, 0], x: "-50%", y: "-50%" }, { duration: 1.5, ease: "easeOut", delay: 0 });

        //             if(!conceptsExist(this.editor, data.user.concepts)){
        //                 console.log("GENERATING CONCEPTS")
        //                 generateConcepts(this.editor, shape.id, data.user.concepts)
        //             }
        //         }).then(() => {
        //             // collection.startSimulation();
        //             setTimeout(() => {
        //                 // Do something else here after waiting for 0.5 seconds
        //                 // generateConceptLinks(this.editor, data.user.concepts)

        //                 setTimeout(()=>{
        //                     expandConcepts?.onComplete && expandConcepts.onComplete()
        //                 }, 2000)
        //                 console.log("FINISHED CONCEPT ANIMATING", expandConcepts)
                        

        //             }, 3000);
        //         })
        //         setDrifting({active: false});

        //     }
        //     else{
        //         // zoom the camera so that it's centred around the shape
        //         this.editor.zoomToBounds(this.editor.getShapePageBounds(shape), {
        //             animation: {
        //                 duration: 300,
        //                 easing: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
        //             },
        //             targetZoom: 1,
        //         });


        //         for(let concept of data.user.concepts){

        //         const conceptShape = this.editor.getShape({id: createShapeId(concept.id), type: 'concept'})
        //         let animTime = 300
        //         if(conceptShape){
        //             // Start the ripple animation
        //             animate(`.ripple`, { scale: [8, 0], opacity: [1, 1], x: "-50%", y: "-50%" }, { duration: 0.5, ease: "easeOut", delay: 0 });

        //             // Start the nameCircle animation simultaneously
 
        //             animate(".nameCircle", { scale: 0.8 }, { duration: 0.2, ease: 'easeInOut', delay: 0.15 })
        //             .then(() => animate(".nameCircle", { scale: 1.2 }, { duration: 0.2, ease: 'easeInOut' }))
        //             .then(() => animate(".nameCircle", { scale: 1 }, { duration: 0.2, ease: 'easeInOut' }))
        //             // .then(() => {
        //             //     animate(".nameCircle", { scale: 1 }, { duration: 0.2, ease: 'easeInOut' });
        //             // });

        //             setTimeout(()=>{
        //                 setConceptList({active: true})
        //                 setDrifting({active: true })
        //             }, 100)

        //             // animateShapeProperties(this.editor, conceptShape.id, { x: shape.x, y: shape.y, opacity: 0 }, animTime, t => t * t).then(() => {
        //             //     deleteAssociatedThreads(this.editor, conceptShape.id)
        //             //     this.editor.deleteShape(conceptShape.id)
        //             //     // delete thread associated with concept
        //             // })   
        //         }
                
        //     }

        //     // collection.startSimulation();
            
        //     console.log("EXPAND CONSTELLATION NAME TRIGGER")
        

        
        // // needs to be in a time out because the canvas position doesn't update while all of these changes are happening
        // }
        // }
        // }, [shape.props.expanded])


        useEffect(() => {
            console.log("DELETE STAR:", deleteStar)
            if (deleteStar.deleted && deleteStar.id === shape.id) {
                // Trigger exit animation
                animate(".nameCircle", { scale: 0.01 }, { duration: 0.5, ease: 'easeInOut' })
                    .then(() => {
                        console.log("DELETING STAR")
                        // Delete the shape after the animation completes
                        this.editor.deleteShape(shape.id);

                        deleteStar.onComplete && deleteStar.onComplete()

                        // setDeleteStar({ deleted: false, id: null });
                    });
            }
        }, [deleteStar]);

        // initial animation
        useEffect(()=>{
            setTimeout(()=>{
            this.editor.zoomToBounds(this.editor.getShapePageBounds(shape), {
                animation: {
                    duration: 300,
                    ease: "easeInOut"
                },
                targetZoom: 1,
            });

            animate(".nameCircle", { scale: 0.8 }, { duration: 0.2, ease: 'easeInOut' })
            .then(() => animate(".nameCircle", { scale: 1.2 }, { duration: 0.2, ease: 'easeInOut' }))
            .then(() => {
                animate(".nameCircle", { scale: 1 }, { duration: 0.2, ease: 'easeInOut' });
                animate(`.ripple`, { scale: [0, 8], opacity: [1, 0], x: "-50%", y: "-50%" }, { duration: 1.5, ease: "easeOut", delay: 0 });

                if(!conceptsExist(this.editor, data.user.concepts)){
                    console.log("GENERATING CONCEPTS")
                    generateConcepts(this.editor, shape.id, data.user.concepts)
                }
            })
        }, 100)
        }, [])
    

        return (
			<HTMLContainer 
				id={shape.id}
				className={styles.container}
				>
                <div 
                    className={styles.shapeContent} 
                    ref={shapeRef} 
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onPointerDown={(e) => {
                        e.stopPropagation() // required so that the central shape isn't selected
                        if(collection && data){
                            // if the concepts are expanded, move them to list mode and start drifting

                            this.editor.zoomToBounds(this.editor.getShapePageBounds(shape), {
                                animation: {
                                    duration: 300,
                                    ease: "easeInOut"
                                },
                                targetZoom: 1,
                            });

                            animate(".nameCircle", { scale: 0.8 }, { duration: 0.2, ease: 'easeInOut' })
                            .then(() => animate(".nameCircle", { scale: 1.2 }, { duration: 0.2, ease: 'easeInOut' }))
                            .then(() => {
                                animate(".nameCircle", { scale: 1 }, { duration: 0.2, ease: 'easeInOut' });
                                animate(`.ripple`, { scale: [0, 8], opacity: [1, 0], x: "-50%", y: "-50%" }, { duration: 1.5, ease: "easeOut", delay: 0 });
                            })
            
            
                            if(!conceptList.active){
                                setDrifting({active: true });
                                setConceptList({active: true, focusedConcept: null})
                            }

                            // if the concepts are in list mode and none of them are active, revert back to the expanded state
                            else if(conceptList.active && !conceptList.focusedConcept){
                                setDrifting({active: false})
                                
                                setConceptList({active: false, focusedConcept: null})
                                

                            }

                            // if the concepts are in list mode and one of them is active, revert back to the expanded state
                            else if(conceptList.active && conceptList.focusedConcept){
                                setConceptList({active: false})
                                setDrifting({active: false, focusedConcept: null})
                            }
                        }
                    }}
                >
                    <div className={styles.circleContainer} ref={scope}>
                    {/* <AnimatePresence>
                        {!isClicked &&
                            <motion.div 
                                key='orbitingRing'
                                className={`${styles.orbitingRingOne} nameCircle`}
                                initial="hidden"
                                exit="exit"
                                animate={["visible", "rotate"]} // Apply both visible and rotate variants
                                custom={{ delay: randomDelay + 1.5 }} // Delay for outer ring
                                variants={orbitingRingVariants}
                            />
                        }
                        </AnimatePresence> */}
                        <AnimatePresence>
                            {isOnlySelected && ( 
                                <motion.div
                                    key="dashedRing"
                                    className={styles.dashedRing}
                                    initial="hidden"
                                    animate={["visible", "rotate"]}
                                    exit="exit"
                                    variants={dashedRingVariants}
                                />
                            )}

                        </AnimatePresence>
                        <motion.div
                            className={`${styles.mostOuterRing} nameCircle`}
                            initial="hidden"
                            animate="visible"
                            custom={randomDelay + 1.25} // Delay for outer ring
                            variants={ringVariants}
                        />
                        <motion.div
                            className={`${styles.outerRing} nameCircle`}
                            initial="hidden"
                            animate="visible"
                            custom={randomDelay + 1.0} // Delay for outer ring
                            variants={ringVariants}
                        />
                        <motion.div
                            className={`${styles.innerRing} nameCircle`}
                            initial="hidden"
                            animate="visible"
                            custom={randomDelay + 0.75} // Delay for inner ring
                            variants={ringVariants}
                        />
                        <motion.div
                            className={`${styles.glow} nameCircle`}
                            initial="hidden"
                            animate="visible"
                            custom={randomDelay + 0.5} // Delay for glow
                            variants={ringVariants}
                        />
                        <motion.div
                            className={`${styles.innerGlow} nameCircle`}
                            initial="hidden"
                            animate="visible"
                            custom={randomDelay + 0.25} // Delay for inner glow
                            variants={ringVariants}
                        />
                        <motion.div
                            className={`${styles.circle} nameCircle`}
                            initial="hidden"
                            animate="visible"
                            custom={randomDelay} // No delay for circle
                            variants={ringVariants}
                        />
                        <motion.div
                        initial="hidden"
                        className={`${styles.ripple} ripple`}
                        variants={ringVariants}
                        transition={{ delay: 0 }}
                    />
                    </div>  
                </div>
                {
                isHovered && shape.props.name && (
                    <motion.div 
                        className={styles.hoverDescription}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        style={{ overflow: 'hidden' }}
                    >
                        <ConstellationMetadata constellationLabel={{visible: true}} animationCommenced={true} />
                    </motion.div>
                )
            }
			</HTMLContainer>
		)
	}

	indicator(shape: NameShape) {
        return
		return <rect width={shape.props.w} height={shape.props.h} />
	}
}