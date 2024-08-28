import {
	BaseBoxShapeUtil,
	Geometry2d,
	Rectangle2d,
	TLBaseShape,
	HTMLContainer,
	stopEventPropagation,
} from '@tldraw/editor'

import { T, createShapeId } from 'tldraw';
import { useLoaderData, useFetcher } from '@remix-run/react';
import { useCallback, useState, useEffect, useRef, useLayoutEffect, useMemo } from 'react'
import styles from './AnnotationShapeUtil.module.css';
import { motion, useAnimate, AnimatePresence, useAnimationControls } from 'framer-motion';
import { useConstellationMode } from '~/components/canvas/custom-ui/utilities/ConstellationModeContext';
import StarterKit from '@tiptap/starter-kit';
import { EditorContent, useEditor } from '@tiptap/react';

const annotationShapeProps = {
	w: T.number,
	h: T.number,
	type: T.string,
	text: T.string,
	temporary: T.boolean,
	from: T.number,
	to: T.number,
	selected: T.boolean,
	hovered: T.boolean,
}

type AnnotationShape = TLBaseShape<
	'annotation',
	{
		w: number
		h: number
		type: string,
		text: string,
		temporary: boolean,
		from: number,
		to: number,
		selected: boolean,
		hovered: boolean,
	}
>

/** @public */
export class AnnotationShapeUtil extends BaseBoxShapeUtil<AnnotationShape> {
	static override type = 'annotation' as const
	static override props = annotationShapeProps

	override canEdit = () => false
	override canResize = () => false
    override hideSelectionBoundsBg = () => false
    override hideSelectionBoundsFg = () => false;

	getDefaultProps(): AnnotationShape['props'] {
		return { 
			w: 200,
			h: 56,
			type: "comment",
			text: "No Text",
			temporary: false,
			from: 0,
			to: 10,
			selected: false,
			hovered: false,
		}
	}

	getGeometry(shape: AnnotationShape): Geometry2d {
		return new Rectangle2d({
			width: shape.props.w,
			height: shape.props.h,
			isFilled: true,
		})
	}

	component(shape: AnnotationShape) {
		const bounds = this.editor.getShapeGeometry(shape).bounds
		const data: any = useLoaderData();
		const [isHovered, setIsHovered] = useState(false)
		const shapeRef = useRef<HTMLDivElement>(null);
		const controls = useAnimationControls()
		const [scope, animate] = useAnimate();
		const fetcher = useFetcher();
		const [link, setLink] = useState("")

		const maskPosition = 100; // Adjust this value dynamically as needed

        useEffect(() => {
            if (fetcher.state === "idle" && fetcher.data && fetcher.data.error) {
                console.error("Fetcher Error:", fetcher.data.error);
            }
        }, [fetcher.state, fetcher.data]);

        useEffect(() => {
            const handleResize = () => {
              if (shapeRef.current?.clientHeight) {
                this.editor.updateShape({
                  type: shape.type,
                  id: shape.id,
                  props: {
                    w: shapeRef.current.clientWidth,
                    h: shapeRef.current.clientHeight
                  }
                });
              }
            };
        
            const resizeObserver = new ResizeObserver(handleResize);
            if (shapeRef.current) {
              resizeObserver.observe(shapeRef.current);
            }
        
            return () => {
              if (shapeRef.current) {
                resizeObserver.unobserve(shapeRef.current);
              }
              resizeObserver.disconnect();
            };
          }, [shapeRef.current, this.editor, shape]);

		useEffect(()=>{
			// on a positional update, get the position of the bound excerpt object
			const mediaBinding = this.editor.getBindingsFromShape(shape.id, 'annotation').find(binding => {
				return this.editor.getShape(binding.toId).type === 'excerpt'
			})


			const mediaShape = mediaBinding ? this.editor.getShape(mediaBinding.toId) : undefined

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

		useEffect(()=>{
			console.log("IMPORTANT UPDATE!")
			if(shape.props.temporary){
				console.log("SHAPE OPACITY:", shape.opacity)
				const mediaBinding = this.editor.getBindingsFromShape(shape.id, 'annotation').find(binding => {
					console.log("BINDING:", this.editor.getShape(binding.toId), this.editor.getShape(binding.toId).type === 'excerpt')
					return this.editor.getShape(binding.toId).type === 'excerpt'
				})

				const mediaObject = mediaBinding ? this.editor.getShape(mediaBinding.toId) : undefined

				if(shape.opacity === 1){
					console.log("SHAPE IS VISIBLE!")
					
					if(mediaObject && this.editor){
						console.log("EDITOR:", this.editor)

						const mediaBounds = this.editor.getShapePageBounds(mediaObject);
						const annotationBounds = this.editor.getShapePageBounds(shape);
						
						console.log("BOUNDS:", annotationBounds, mediaBounds)
							// Calculate the combined bounding box
						const combinedBounds = {
							x: Math.min(mediaBounds.x, annotationBounds.x),
							y: Math.min(mediaBounds.y, annotationBounds.y),
							w: Math.max(annotationBounds.x+annotationBounds.w, mediaBounds.x+mediaBounds.w) - Math.min(annotationBounds.x, mediaBounds.x),
							h: Math.max(mediaBounds.h, annotationBounds.h),
						};
						
						setTimeout(() => {
							this.editor.zoomToBounds(combinedBounds, {
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
						this.editor.zoomToBounds(this.editor.getShapePageBounds(mediaObject), {
							targetZoom: 3,
							animation: {
								duration: 300
							}
						})
					}
				}
			}
		}, [shape.opacity, shape.props.temporary, shape.props.selected])
		
		const editor = useEditor({
			extensions: [StarterKit],
			content: shape.props.text,
			onUpdate: ({ editor }) => {
				const html = editor.getHTML();
				// Update the shape's text property with the new content
				this.editor.updateShape({
					type: shape.type,
					id: shape.id,
					props: {
						text: html,
					},
				});
			},
		});


		return (
			<div 
				id={shape.id}
				className={styles.container}	
				ref={scope}			
				>
				<div 
                    className={styles.shapeContent} 
                    ref={shapeRef} 
                    style={{
						backgroundColor: isHovered ? "rgba(0, 0, 0, 0.4)" : "rgba(0, 0, 0, 0.1)",
						left: isHovered ? '-10px' : "0px",
						boxShadow: isHovered ? "0px 36px 42px -4px rgba(77, 77, 77, 0.4)" : "0px 36px 42px -4px rgba(77, 77, 77, 0.15)",
						border: shape.props.hovered ? '2px solid pink' : (shape.props.selected ? "2px solid blue" : "none"),
						visibility: (shape.props.temporary || shape.props.hovered || shape.props.selected) ? "visible" : "hidden"
                        }}
					onMouseEnter={() => setIsHovered(true)}
					onMouseLeave={() => setIsHovered(false)}
					onPointerDown={() => {
						// trigger camera zoom

						const mediaBinding = this.editor.getBindingsFromShape(shape.id, 'annotation').find(binding => {
							return this.editor.getShape(binding.toId).type === 'excerpt'
						})

						const mediaObject = mediaBinding ? this.editor.getShape(mediaBinding.toId) : undefined

						if(mediaObject && this.editor){


							const mediaBounds = this.editor.getShapePageBounds(mediaObject);
							const annotationBounds = this.editor.getShapePageBounds(shape);
							
								// Calculate the combined bounding box
							const combinedBounds = {
								x: Math.min(mediaBounds.x, annotationBounds.x),
								y: Math.min(mediaBounds.y, annotationBounds.y),
								w: Math.max(annotationBounds.x+annotationBounds.w, mediaBounds.x+mediaBounds.w) - Math.min(annotationBounds.x, mediaBounds.x),
								h: Math.max(mediaBounds.h, annotationBounds.h),
							};
					
							this.editor.zoomToBounds(combinedBounds, {
							animation: {
								duration: 300
							},
							targetZoom: 4,
						});
						}
					}}
                    >
					<div className={styles.headerRow}>
						<div className={styles.iconWrapper}></div>
						<p className={styles.userName}> Finn Macken</p>
						<p className={styles.timeStamp}>1m</p>
					</div>
					<EditorContent editor={editor} className={styles.textContent}/>

					{shape.props.temporary &&
						<button 
							style={{
								fontSize: "10px",
								color: "blue",
								fontWeight: '800',
								cursor: 'pointer',
	
							}}
							onPointerDown={async (e) => {
								console.log("POINTER DOWN ON NEW ANNOTATION")
								const mediaBinding = this.editor.getBindingsFromShape(shape.id, 'annotation').find(binding => {
									console.log("BINDING:", this.editor.getShape(binding.toId), this.editor.getShape(binding.toId).type === 'excerpt')
									return this.editor.getShape(binding.toId).type === 'excerpt'
								})

								// save annotation to database
								if (mediaBinding) {

									fetcher.submit(
										{
											actionType: "saveAnnotation",
											mediaId: this.editor.getShape(mediaBinding.toId)?.props.media.id,
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
					}
				</div>
			</div>
		)
	}

	indicator(shape: AnnotationShape) {
        return null
		// return <rect width={shape.props.w} height={shape.props.h} />
	}


}