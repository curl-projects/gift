import styles from './AnnotationShapeUtil.module.css';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';

export function CommentAnnotation({ 
    data,
    animate,
    shape, 
    shapeRef, 
    isOnlySelected, 
    tldrawEditor, 
    fetcher 
    }){
	const ringSize = {width: 20, height: 20}
    const [charCount, setCharCount] = useState(0)
	const [isHovered, setIsHovered] = useState(false)

    // TEXT EDITOR
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: "Offer up something...",
            }),
        ],
        content: shape.props.text,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            setCharCount(editor.getText().length)
            // Update the shape's text property with the new content
            tldrawEditor.updateShape({
                type: shape.type,
                id: shape.id,
                props: {
                    text: html,
                },
            });
        },
    });


    useEffect(()=>{
        if(shape.props.temporary && isOnlySelected){
            console.log("RUNNING EFFECT!")
            animate(`.ripple`, { scale: [1, 3], opacity: [0, 1, 0], x: "-50%", y: "-50%" }, { duration: 4, ease: "easeOut" });
        }
    }, [isOnlySelected])

    // SCROLL OUT OF VIEW ALONGSIDE THE EXCERPT
		useEffect(()=>{
			// on a positional update, get the position of the bound excerpt object
			const mediaBinding = tldrawEditor.getBindingsFromShape(shape.id, 'annotation').find(binding => {
				return tldrawEditor.getShape(binding.toId).type === 'excerpt'
			})


			const mediaShape = mediaBinding ? tldrawEditor.getShape(mediaBinding.toId) : undefined

			if(mediaShape){
				const top = Math.max(0, mediaShape.y - shape.y)
				const bottom = Math.max(0, (shape.y+shape.props.h) - (mediaShape.y + mediaShape.props.h))
				shapeRef.current.style.clipPath = `inset(${top}px 0 ${bottom}px 0)`;
				if (top > 0 || bottom > 0) {
					shapeRef.current.style.maskImage = `linear-gradient(to bottom, transparent ${top}px, black ${top + 20}px, black calc(100% - ${bottom + 20}px), transparent calc(100% - ${bottom}px))`;
				} else {
					shapeRef.current.style.maskImage = 'none';
				}
			}
		}, [shape.x, shape.y])		
    
    // ZOOM LOGIC FOR TEMPORARY ANNOTATION 
    useEffect(()=>{
        if(shape.props.temporary){
            const mediaBinding = tldrawEditor.getBindingsFromShape(shape.id, 'annotation').find(binding => {
                console.log("BINDING:", tldrawEditor.getShape(binding.toId), tldrawEditor.getShape(binding.toId).type === 'excerpt')
                return tldrawEditor.getShape(binding.toId).type === 'excerpt'
            })

            const mediaObject = mediaBinding ? tldrawEditor.getShape(mediaBinding.toId) : undefined

            if(shape.opacity === 1){
                console.log("SHAPE IS VISIBLE!")
                
                if(mediaObject && tldrawEditor){
                    console.log("EDITOR:", tldrawEditor)

                    const mediaBounds = tldrawEditor.getShapePageBounds(mediaObject);
                    const annotationBounds = tldrawEditor.getShapePageBounds(shape);
                    
                    console.log("BOUNDS:", annotationBounds, mediaBounds)
                        // Calculate the combined bounding box
                    const combinedBounds = {
                        x: Math.min(mediaBounds.x, annotationBounds.x),
                        y: Math.min(mediaBounds.y, annotationBounds.y),
                        w: Math.max(annotationBounds.x+annotationBounds.w, mediaBounds.x+mediaBounds.w) - Math.min(annotationBounds.x, mediaBounds.x),
                        h: Math.max(mediaBounds.h, annotationBounds.h),
                    };
                    
                    setTimeout(() => {
                        tldrawEditor.zoomToBounds(combinedBounds, {
                            animation: {
                                duration: 300
                            },
                            targetZoom: 4,
                        });
                    }, 200)
                    
                }
            }
            else if(shape.opacity === 0){
                if(mediaObject){
                    tldrawEditor.zoomToBounds(tldrawEditor.getShapePageBounds(mediaObject), {
                        targetZoom: 3,
                        animation: {
                            duration: 300
                        }
                    })
                }
            }
        }
    }, [shape.opacity, shape.props.temporary, shape.props.selected])

    const rippleVariants = {
        hidden: { opacity: 0, x: "-50%", y: "-50%" },
        visible: { opacity: 0, x: "-50%", y: "-50%" } 
    }

    const innerRingVariants = {
        hidden: { scale: 0, x: "-50%", y: "-50%" },
        visible: (delay = 0) => ({
            scale: 1.2,
            x: "-50%", 
            y: "-50%",
            transition: { duration: 1, ease: "easeOut", delay },
            rotate: 360
        }),
        rotate: {
            rotate: [0, 360],
            transition: { repeat: Infinity, duration: 30, ease: "linear" }
        }
    };

    const outerRingVariants = {
        hidden: { scale: 0, x: "-50%", y: "-50%" },
        visible: (delay = 0) => ({
            scale: 2,
            x: "-50%", 
            y: "-50%",
            transition: { duration: 1, ease: "easeOut", delay },
            rotate: -360
        }),
        rotate: {
            rotate: [0, -360],
            transition: { repeat: Infinity, duration: 30, ease: "linear" }
        }
    };

    return(
        <>
        {shape.props.temporary &&
					<>
						<motion.div 
							initial="visible"
							animate="visible"
							className={`${styles.ripple} ripple`}
							style={{
								height: ringSize.width,
								width: ringSize.width
							}}
							variants={rippleVariants}
								// transition={{ delay: 0}}
							>
							</motion.div>
							<AnimatePresence>
								{charCount >= 100 && 
									<>
										<motion.div
										initial="hidden"
										className={`${styles.outerRing} conceptCircle`}
											animate={["visible", "rotate"]}
											style={{
												height: ringSize.width,
												width: ringSize.width
											}}
											custom={0} // Delay for outer ring
											variants={outerRingVariants}
										/>
									</>
								}
							</AnimatePresence>
							<AnimatePresence>
								{charCount >= 50 &&
									<>
									<motion.div
									className={`${styles.innerRing} conceptCircle`}
									initial="hidden"
									style={{
										height: ringSize.width,
										width: ringSize.width
									}}
									animate={["visible", "rotate"]}
									custom={0} // Delay for inner ring
									variants={innerRingVariants}
									/>
									{/* <motion.div
										initial="hidden"
										className={`${styles.innerGlow} conceptCircle`}
											animate="visible"
											style={{
												height: ringSize.width,
												width: ringSize.width
											}}
											custom={0} // Delay for outer ring
											variants={innerRingVariants}
										/> */}
									</>
								}
							</AnimatePresence>
					</>
					}
				<div 
                    className={styles.shapeContentComment} 
                    ref={shapeRef} 
                    style={{
						backgroundColor: isHovered ? "rgba(0, 0, 0, 0.2)" : "rgba(0, 0, 0, 0.1)",
						left: (shape.props.temporary || shape.props.selected || isHovered) ? '-10px' : "0px",
						boxShadow: isHovered ? "0px 36px 42px -4px rgba(77, 77, 77, 0.4)" : "0px 36px 42px -4px rgba(77, 77, 77, 0.15)",
						// border: shape.props.hovered ? '2px solid pink' : (shape.props.selected ? "2px solid blue" : "none"),
						visibility: (shape.props.temporary || shape.props.hovered || shape.props.selected) ? "visible" : "hidden"
                        }}
					onMouseEnter={() => setIsHovered(true)}
					onMouseLeave={() => setIsHovered(false)}
					onPointerDown={() => {
						if(shape.props.temporary){
							setNarratorEvent("leaveAnnotation")
						}
					}}
                    >
						
					<div className={styles.headerRow}>
						<div className={styles.iconWrapper}></div>
						<p className={styles.userName}> Finn Macken</p>
						<p className={styles.timeStamp}>1m</p>
					</div>
					<div className={styles.linkRow}>
						
					</div>
					<EditorContent editor={editor} className={styles.textContent}/>

					{shape.props.temporary &&
					<>
						<button 
							style={{
								fontSize: "10px",
								color: "blue",
								fontWeight: '800',
								cursor: 'pointer',
	
							}}
							onPointerDown={async (e) => {
								console.log("POINTER DOWN ON NEW ANNOTATION")
								const mediaBinding = tldrawEditor.getBindingsFromShape(shape.id, 'annotation').find(binding => {
									console.log("BINDING:", tldrawEditor.getShape(binding.toId), tldrawEditor.getShape(binding.toId).type === 'excerpt')
									return tldrawEditor.getShape(binding.toId).type === 'excerpt'
								})

								// save annotation to database
								if (mediaBinding) {

									fetcher.submit(
										{
											actionType: "saveAnnotation",
											mediaId: tldrawEditor.getShape(mediaBinding.toId)?.props.media.id,
											content: shape.props.text,
											fromPos: shape.props.from,
											toPos: shape.props.to,
										},
										{ method: "post", action: `/world-models/${data.user.uniqueName}` }
									);
								}
								

								e.preventDefault();


							}}>
							Highlight
						</button>
						<p style={{
							color: 'white',
						}}>{charCount} characters</p>
					</>
					}
				</div>
        </>
    )
}