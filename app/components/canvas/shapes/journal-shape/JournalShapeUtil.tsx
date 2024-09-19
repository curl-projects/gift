import {
	BaseBoxShapeUtil,
	Geometry2d,
	Rectangle2d,
	TLBaseShape,
	HTMLContainer,
	stopEventPropagation,
} from '@tldraw/editor'

import { T, createShapeId } from 'tldraw';
import { useLoaderData } from '@remix-run/react';
import { useCallback, useState, useEffect, useRef, useLayoutEffect, useMemo } from 'react'
import { EditorContent, useEditor } from '@tiptap/react';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { Node } from "@tiptap/core";
import Placeholder from '@tiptap/extension-placeholder'
import styles from './JournalShapeUtil.module.css';
import { motion, useAnimate, AnimatePresence } from 'framer-motion';
import { InkBleed } from "~/components/canvas/custom-ui/post-processing-effects/InkBleed"
import { JournalThread } from './journal-thread/JournalThread';
import { JournalBorder } from './journal-border/JournalBorder';
import { JournalMenu } from './journal-menu/JournalMenu';
import { useStarFireSync } from "~/components/synchronization/StarFireSync"

// pages
import {Cover} from './journal-pages/cover/Cover';
import {Pitch} from './journal-pages/pitch/Pitch';

const journalShapeProps = {
	w: T.number,
	h: T.number,
    expanded: T.boolean,
    page: T.string,
}

type JournalShape = TLBaseShape<
	'journal',
	{
		w: number,
		h: number,
        expanded: boolean,
        page: string,
	}
>

/** @public */
export class JournalShapeUtil extends BaseBoxShapeUtil<JournalShape> {
	static override type = 'journal' as const
	static override props = journalShapeProps

	override canEdit = () => false
	override canResize = () => false
    override hideSelectionBoundsBg = () => false
    override hideSelectionBoundsFg = () => false;

	getDefaultProps(): JournalShape['props'] {
		return { 
			w: window.innerWidth * 0.4,
			h: window.innerHeight * 0.8,
            expanded: false,
            page: 'cover',
		}
	}

	getGeometry(shape: JournalShape): Geometry2d {
		return new Rectangle2d({
			width: shape.props.w,
			height: shape.props.h,
			isFilled: true,
		})
	}

	component(shape: JournalShape) {
        const [scope, animate] = useAnimate();
		const bounds = this.editor.getShapeGeometry(shape).bounds
		const data: any = useLoaderData();
        const contentRef = useRef<HTMLDivElement>(null);
        const [page, setPage] = useState(shape.props.page);
        const { journalMode } = useStarFireSync()

        const [inkVisible, setInkVisible] = useState(false);
        const [outerBorderVisibility, setOuterBorderVisibility] = useState({
            bottom: false,
            left: false,
            right: false,
            top: false,
        });
        const [innerBorderVisibility, setInnerBorderVisibility] = useState({
            bottom: false,
            left: false,
            right: false,
            top: false,
        });

        useEffect(()=>{
            // trigger camera change
            const nameShape = this.editor.getShape(createShapeId('andre-vacha'))
           
            if(nameShape){
                const bounds = this.editor.getShapePageBounds(nameShape)
                const newBounds = {
                    w: bounds.width,
                    h: bounds.height,
                    x: bounds.x + window.innerWidth * 0.20,
                    y: bounds.y
                }
                
                this.editor.zoomToBounds(newBounds, {
                    animation: {
                        duration: 300,
                        easing: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
                },
                    targetZoom: 1,
                });
            }
        }, [])

        useEffect(() => {
            const handleResize = () => {
                this.editor.updateShape({
                  type: shape.type,
                  id: shape.id,
                  props: {
                    w: window.innerWidth * 0.4,
                    h: window.innerHeight * 0.8
                  }
            });
            };
        
            window.addEventListener('resize', handleResize);
        
            return () => {
                window.removeEventListener('resize', handleResize);
            };
          }, [this.editor, shape]);

        //   triggers on animation frame
          useEffect(() => {
            const margin = window.innerHeight * 0.1;

            const updateShapePosition = () => {
                const { x, y } = this.editor.screenToPage({ x: window.innerWidth * 0.6 - margin, y: margin });
                this.editor.updateShape({
                    type: shape.type,
                    id: shape.id,
                    x: x,
                    y: y,
                    props: {
                        w: window.innerWidth * 0.4,
                        h: window.innerHeight * 0.8,
                    }
                });
                requestAnimationFrame(updateShapePosition);
            };

            const animationId = requestAnimationFrame(updateShapePosition);

            return () => cancelAnimationFrame(animationId);
          }, [this.editor, shape]);   

		return (
            <HTMLContainer style={{
                width: shape.props.w,
                height: shape.props.h,
                transform: 'scale(var(--tl-scale))',
                }}>
                <AnimatePresence>
                {shape.props.expanded &&
                    <motion.div 
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, ease: 'easeInOut'}}
                    onAnimationComplete={(animation) => {
                        if(animation?.opacity === 0){
                            this.editor.deleteShape(shape.id) // dispose of shape after completion
                        }
                    }}
                    key='journal'
                    id={shape.id}
                    className={styles.container}
                    style={{
                        width: "100%",
                        height: "100%",
                    }}				
                    >
                    <div 
                        className={styles.shapeContent}
                        ref={contentRef}
                        onPointerDown={(e) => {
                            e.stopPropagation();
                        }}
                        onScrollCapture={(e) => e.stopPropagation()}
                        onWheelCapture={(e) => {
							e.stopPropagation();
						}}
                        style={{
                            }}   
                        >
                        <motion.div
                            className={styles.shapeContentBackground}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 1 }} // Adjust delay as needed
                            onAnimationComplete={(animation) => {
                                console.log("BACKGROUND COMPLETED")
                                if(animation?.opacity === 1){
                                    setInkVisible(true)

                                    setTimeout(()=>{
                                        journalMode.onComplete && journalMode.onComplete()
                                    }, 1000)
                                }
                            }}
                            style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            willChange: 'opacity', // Add will-change property
                            // backgroundImage: 'url("/assets/old-paper.jpg")',
                            // backgroundSize: 'cover',
                            // backgroundPosition: 'center',
                            }}
                        />

                                        
                            {/* outer border */}
                            <JournalBorder borderThickness={4} distance={20} borderVisibility={outerBorderVisibility} />

                            {/* inner border */}
                            <JournalBorder borderThickness={2} distance={30} borderVisibility={innerBorderVisibility}/>

                        
                            {inkVisible && (
                                <>
                                <JournalMenu page={page} setPage={setPage}/>
                                {/* <InkBleed 
                                    initialBlur={200}
                                    delay={0}
                                    duration={4}
                                >
                                <div className={styles.exampleCircle}/>
                                </InkBleed> */}
                                <div className={styles.journalPageContainer}>
                                        <AnimatePresence>
                                        {
                                            {
                                                'cover': <Cover key='cover'/>,
                                                'pitch': <Pitch key='pitch'/>,
                                            }[page]
                                        }
                                    </AnimatePresence>
                                </div>
                            </>
                            )}
                    </div>

                    
                    <svg className={styles.animatedLine} viewBox={`0 0 ${shape.props.w} ${shape.props.h}`}>

                        <JournalThread 
                            d={`M -5 -5 L ${shape.props.w + 5} -5 L ${shape.props.w + 5} ${shape.props.h + 5} L -5 ${shape.props.h + 5} Z`} 
                            delay={0} 
                            duration={1} 
                            strokeWidth={1} 
                            pageContainer 
                        />

                        {/* outer line */}

                        {/* top */}
                        <JournalThread 
                            d={`M 20 20 L ${shape.props.w - 20} 20`} 
                            delay={1}
                            duration={0.5}
                            strokeWidth={1} 
                            onOpaque={() => setOuterBorderVisibility(prevState => ({...prevState, left: true}))}
                        />

                        {/* { left } */}
                        <JournalThread 
                            d={`M 20 20 L 20 ${shape.props.h - 20}`} 
                            delay={1} 
                            duration={0.5}
                            strokeWidth={1} 
                            onOpaque={() => setOuterBorderVisibility(prevState => ({...prevState, top: true}))}
                        />
                        
                        {/* bottom */}
                        <JournalThread 
                            d={`M 20 ${shape.props.h - 20} L ${shape.props.w - 20} ${shape.props.h - 20}`} 
                            delay={1.3}
                            duration={0.5}
                            strokeWidth={1} 
                            onOpaque={() => setOuterBorderVisibility(prevState => ({...prevState, right: true}))}
                        />

                        {/* right */}
                        <JournalThread 
                            d={`M ${shape.props.w - 20} 20 L ${shape.props.w - 20} ${shape.props.h - 20}`} 
                            delay={1.3}
                            duration={0.5}
                            strokeWidth={1} 
                            onOpaque={() => setOuterBorderVisibility(prevState => ({...prevState, bottom: true}))}
                        />

                        {/* inner line */}
                        <JournalThread 
                            d={`M 30 30 L ${shape.props.w - 30} 30`} 
                            delay={1.5}
                            duration={0.5} 
                            strokeWidth={1} 
                            onOpaque={() => setInnerBorderVisibility(prevState => ({...prevState, left: true}))}
                        />
                        <JournalThread 
                            d={`M 30 30 L 30 ${shape.props.h - 30}`} 
                            delay={1.5}
                            duration={0.5} 
                            strokeWidth={1} 
                            onOpaque={() => setInnerBorderVisibility(prevState => ({...prevState, top: true}))}
                        />
                        <JournalThread 
                            d={`M 30 ${shape.props.h - 30} L ${shape.props.w - 30} ${shape.props.h - 30}`} 
                            delay={1.8} 
                            duration={0.5}
                            strokeWidth={1} 
                            onOpaque={() => setInnerBorderVisibility(prevState => ({...prevState, right: true}))}
                        />
                        <JournalThread 
                            d={`M ${shape.props.w - 30} 30 L ${shape.props.w - 30} ${shape.props.h - 30}`} 
                            delay={1.8} 
                            duration={0.5}
                            strokeWidth={1} 
                            onOpaque={() => {
                                setInnerBorderVisibility(prevState => ({...prevState, bottom: true}))
                            }}
                        />

                    </svg>
                    </motion.div>
                }
                </AnimatePresence>
            </HTMLContainer>
		)
        
	}
    

	indicator(shape: JournalShape) {
        return null
		// return <rect width={shape.props.w} height={shape.props.h} />

	}
}