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
import styles from './NameShapeUtil.module.css';
import { motion, useAnimate } from 'framer-motion';

const NameShapeProps = {
	w: T.number,
	h: T.number,
	name: T.string
}

type NameShape = TLBaseShape<
	'name',
	{
		w: number
		h: number
        name: string
	}
>


/** @public */
export class NameShapeUtil extends BaseBoxShapeUtil<NameShape> {
	static override type = 'name' as const
	static override props = nameShapeProps

	override canEdit = () => true

	override canResize = () => false


	getDefaultProps(): ExcerptShape['props'] {
		return { 
			w: 200,
			h: 20,
			name: "AV",
		}
	}

	getGeometry(shape: ExcerptShape): Geometry2d {
		return new Rectangle2d({
			width: shape.props.w,
			height: shape.props.h,
			isFilled: true,
		})
	}

	component(shape: ExcerptShape) {
		const shapeRef = useRef();

		useEffect(()=>{
			if(shapeRef.current){
				this.editor.updateShape({id: shape.id, type: shape.type, props: {
					w: shapeRef.current.clientWidth,
					h: shapeRef.current.clientHeight
				}})
			}
		}, [this.editor, shapeRef])
        
        return (
			<HTMLContainer 
				id={shape.id}
				className={styles.container}
				
				>
				<div ref={shapeRef} className={styles.excerptBox}>
					<p className={styles.excerptText}><span className={styles.connectionPoint}/>
					{shape.props.plainText}
					</p>
				</div>
			</HTMLContainer>
		)
	}


	indicator(shape: ExcerptShape) {
		return <rect width={shape.props.w} height={shape.props.h} />

	}
}