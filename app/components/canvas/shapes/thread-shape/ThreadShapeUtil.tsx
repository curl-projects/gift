import {
	Arc2d,
	Box,
	Edge2d,
	Editor,
	Geometry2d,
	Group2d,
	Rectangle2d,
	SVGContainer,
	ShapeUtil,
	SvgExportContext,
	// TLThreadBinding,
	// TLThreadShape,
	// TLThreadShapeProps,
    TLShape,
	TLHandle,
	TLResizeInfo,
	TLShapePartial,
	TLShapeUtilCanBindOpts,
	TLShapeUtilCanvasSvgDef,
	Vec,
	WeakCache,
	// threadShapeMigrations,
	// threadShapeProps,
	lerp,
	// mapObjectMapValues,
	structuredClone,
	toDomPrecision,
	track,
	useEditor,
	useIsEditing,
	useValue,
} from '@tldraw/editor'

import { mapObjectMapValues } from "./threadshared/mapObjectMapValues"
import { getPerfectDashProps } from './shared/getPerfectDashProps'
import { TLThreadBinding } from '../../bindings/thread-binding/TLThreadBinding'
import { TLThreadShape, TLThreadShapeProps, threadShapeMigrations, threadShapeProps } from './threadtypes/TLThreadShape'
import React from 'react'
import { updateThreadTerminal } from '~/components/canvas/bindings/thread-binding/ThreadBindingUtil'
import { ShapeFill } from './shared/ShapeFill'
// import { SvgTextLabel } from '../shared/SvgTextLabel'
// import { TextLabel } from '../shared/TextLabel'
import { STROKE_SIZES, TEXT_PROPS } from './shared/default-shape-constants'
import {
	getFillDefForCanvas,
	getFillDefForExport,
	getFontDefForExport,
} from './shared/defaultStyleDefs'
import { useDefaultColorTheme } from './shared/useDefaultColorTheme'
// import { getThreadLabelFontSize, getThreadLabelPosition } from './threadLabel'
import { getThreadheadPathForType } from './threadheads/threadheads'
import {
	getCurvedThreadHandlePath,
	getSolidCurvedThreadPath,
	getSolidStraightThreadPath,
	getStraightThreadHandlePath,
} from './threadpaths/threadpaths'

import {
	TLThreadBindings,
	createOrUpdateThreadBinding,
	getThreadBindings,
	getThreadInfo,
	getThreadTerminalsInThreadSpace,
	removeThreadBinding,
} from './threadshared/threadshared'

import { motion, useAnimation } from 'framer-motion'
import { useEffect } from 'react'


export interface TLHandleDragInfo<T extends TLShape> {
	handle: TLHandle
	isPrecise: boolean
	initial?: T | undefined
}


let globalRenderIndex = 0

enum ARROW_HANDLES {
	START = 'start',
	MIDDLE = 'middle',
	END = 'end',
}

/** @public */
export class ThreadShapeUtil extends ShapeUtil<TLThreadShape> {
	static override type = 'thread' as const
	static override props = threadShapeProps
	static override migrations = threadShapeMigrations

	override canEdit= () => {
		return true
	}
	override canBind({ toShapeType }: TLShapeUtilCanBindOpts<TLThreadShape>): boolean {
		// bindings can go from threads to shapes, but not from shapes to threads
		return toShapeType !== 'thread'
	}
	override canSnap = () => {
		return false
	}
	override hideResizeHandles = () => {
		return true
	}
	override hideRotateHandle = () => {
		return true
	}
	override hideSelectionBoundsBg = () => {
		return true
	}
	override hideSelectionBoundsFg = () => {
		return true
	}

	override canBeLaidOut = (shape: TLThreadShape) => {
		const bindings = getThreadBindings(this.editor, shape)
		return !bindings.start && !bindings.end
	}

	override getDefaultProps = (): TLThreadShape['props'] => {
		return {
			dash: 'draw',
			size: 'm',
			fill: 'none',
			color: 'black',
			threadColor: 'black',
			bend: 0,
			start: { x: 0, y: 0 },
			end: { x: 2, y: 0 },
			threadheadStart: 'none',
			threadheadEnd: 'none',
			text: '',
			labelPosition: 0.5,
			font: 'draw',
			scale: 1,
		}
	}

	getGeometry(shape: TLThreadShape) {
		const info = getThreadInfo(this.editor, shape)!

		const debugGeom: Geometry2d[] = []

		const bodyGeom = info.isStraight
			? new Edge2d({
					start: Vec.From(info.start.point),
					end: Vec.From(info.end.point),
				})
			: new Arc2d({
					center: Vec.Cast(info.handleArc.center),
					start: Vec.Cast(info.start.point),
					end: Vec.Cast(info.end.point),
					sweepFlag: info.bodyArc.sweepFlag,
					largeArcFlag: info.bodyArc.largeArcFlag,
				})

		let labelGeom
		// if (shape.props.text.trim()) {
		// 	const labelPosition = getThreadLabelPosition(this.editor, shape)
		// 	debugGeom.push(...labelPosition.debugGeom)
		// 	labelGeom = new Rectangle2d({
		// 		x: labelPosition.box.x,
		// 		y: labelPosition.box.y,
		// 		width: labelPosition.box.w,
		// 		height: labelPosition.box.h,
		// 		isFilled: true,
		// 		isLabel: true,
		// 	})
		// }

		return new Group2d({
			children: [...(labelGeom ? [bodyGeom, labelGeom] : [bodyGeom]), ...debugGeom],
		})
	}

	override getHandles(shape: TLThreadShape): TLHandle[] {
		const info = getThreadInfo(this.editor, shape)!

		return [
			{
				id: ARROW_HANDLES.START,
				type: 'vertex',
				index: 'a0',
				x: info.start.handle.x,
				y: info.start.handle.y,
			},
			{
				id: ARROW_HANDLES.MIDDLE,
				type: 'virtual',
				index: 'a2',
				x: info.middle.x,
				y: info.middle.y,
			},
			{
				id: ARROW_HANDLES.END,
				type: 'vertex',
				index: 'a3',
				x: info.end.handle.x,
				y: info.end.handle.y,
			},
		].filter(Boolean) as TLHandle[]
	}

	getText = (shape: TLThreadShape) => {
		return shape.props.text
	}

	override onHandleDrag = (
		shape: TLThreadShape,
		{ handle, isPrecise }: TLHandleDragInfo<TLThreadShape>
	) => {
		const handleId = handle.id as ARROW_HANDLES
		const bindings = getThreadBindings(this.editor, shape)

		if (handleId === ARROW_HANDLES.MIDDLE) {
			// Bending the thread...
			const { start, end } = getThreadTerminalsInThreadSpace(this.editor, shape, bindings)

			const delta = Vec.Sub(end, start)
			const v = Vec.Per(delta)

			const med = Vec.Med(end, start)
			const A = Vec.Sub(med, v)
			const B = Vec.Add(med, v)

			const point = Vec.NearestPointOnLineSegment(A, B, handle, false)
			let bend = Vec.Dist(point, med)
			if (Vec.Clockwise(point, end, med)) bend *= -1
			return { id: shape.id, type: shape.type, props: { bend } }
		}

		// Start or end, pointing the thread...

		const update: TLShapePartial<TLThreadShape> = { id: shape.id, type: 'thread', props: {} }

		const currentBinding = bindings[handleId]

		const otherHandleId = handleId === ARROW_HANDLES.START ? ARROW_HANDLES.END : ARROW_HANDLES.START
		const otherBinding = bindings[otherHandleId]

		if (this.editor.inputs.ctrlKey) {
			// todo: maybe double check that this isn't equal to the other handle too?
			// Skip binding
			removeThreadBinding(this.editor, shape, handleId)

			update.props![handleId] = {
				x: handle.x,
				y: handle.y,
			}
			return update
		}

		const point = this.editor.getShapePageTransform(shape.id)!.applyToPoint(handle)

		const target = this.editor.getShapeAtPoint(point, {
			hitInside: true,
			hitFrameInside: true,
			margin: 0,
			filter: (targetShape) => {
				return (
					!targetShape.isLocked &&
					this.editor.canBindShapes({ fromShape: shape, toShape: targetShape, binding: 'thread' })
				)
			},
		})

		if (!target) {
			// todo: maybe double check that this isn't equal to the other handle too?
			removeThreadBinding(this.editor, shape, handleId)

			update.props![handleId] = {
				x: handle.x,
				y: handle.y,
			}
			return update
		}

		// we've got a target! the handle is being dragged over a shape, bind to it

		const targetGeometry = this.editor.getShapeGeometry(target)
		const targetBounds = Box.ZeroFix(targetGeometry.bounds)
		const pageTransform = this.editor.getShapePageTransform(update.id)!
		const pointInPageSpace = pageTransform.applyToPoint(handle)
		const pointInTargetSpace = this.editor.getPointInShapeSpace(target, pointInPageSpace)

		let precise = isPrecise

		if (!precise) {
			// If we're switching to a new bound shape, then precise only if moving slowly
			if (!currentBinding || (currentBinding && target.id !== currentBinding.toId)) {
				precise = this.editor.inputs.pointerVelocity.len() < 0.5
			}
		}

		if (!isPrecise) {
			if (!targetGeometry.isClosed) {
				precise = true
			}

			// Double check that we're not going to be doing an imprecise snap on
			// the same shape twice, as this would result in a zero length line
			if (otherBinding && target.id === otherBinding.toId && otherBinding.props.isPrecise) {
				precise = true
			}
		}

		const normalizedAnchor = {
			x: (pointInTargetSpace.x - targetBounds.minX) / targetBounds.width,
			y: (pointInTargetSpace.y - targetBounds.minY) / targetBounds.height,
		}

		if (precise) {
			// Turn off precision if we're within a certain distance to the center of the shape.
			// Funky math but we want the snap distance to be 4 at the minimum and either
			// 16 or 15% of the smaller dimension of the target shape, whichever is smaller
			if (
				Vec.Dist(pointInTargetSpace, targetBounds.center) <
				Math.max(4, Math.min(Math.min(targetBounds.width, targetBounds.height) * 0.15, 16)) /
					this.editor.getZoomLevel()
			) {
				normalizedAnchor.x = 0.5
				normalizedAnchor.y = 0.5
			}
		}

		const b = {
			terminal: handleId,
			normalizedAnchor,
			isPrecise: precise,
			isExact: this.editor.inputs.altKey,
		}

		createOrUpdateThreadBinding(this.editor, shape, target.id, b)

		this.editor.setHintingShapes([target.id])

		const newBindings = getThreadBindings(this.editor, shape)
		if (newBindings.start && newBindings.end && newBindings.start.toId === newBindings.end.toId) {
			if (
				Vec.Equals(newBindings.start.props.normalizedAnchor, newBindings.end.props.normalizedAnchor)
			) {
				createOrUpdateThreadBinding(this.editor, shape, newBindings.end.toId, {
					...newBindings.end.props,
					normalizedAnchor: {
						x: newBindings.end.props.normalizedAnchor.x + 0.05,
						y: newBindings.end.props.normalizedAnchor.y,
					},
				})
			}
		}

		return update
	}

	override onTranslateStart = (shape: TLThreadShape) => {
		const bindings = getThreadBindings(this.editor, shape)

		const terminalsInThreadSpace = getThreadTerminalsInThreadSpace(this.editor, shape, bindings)
		const shapePageTransform = this.editor.getShapePageTransform(shape.id)!

		// If at least one bound shape is in the selection, do nothing;
		// If no bound shapes are in the selection, unbind any bound shapes

		const selectedShapeIds = this.editor.getSelectedShapeIds()

		if (
			(bindings.start &&
				(selectedShapeIds.includes(bindings.start.toId) ||
					this.editor.isAncestorSelected(bindings.start.toId))) ||
			(bindings.end &&
				(selectedShapeIds.includes(bindings.end.toId) ||
					this.editor.isAncestorSelected(bindings.end.toId)))
		) {
			return
		}

		// When we start translating shapes, record where their bindings were in page space so we
		// can maintain them as we translate the thread
		shapeAtTranslationStart.set(shape, {
			pagePosition: shapePageTransform.applyToPoint(shape),
			terminalBindings: mapObjectMapValues(terminalsInThreadSpace, (terminalName, point) => {
				const binding = bindings[terminalName]
				if (!binding) return null
				return {
					binding,
					shapePosition: point,
					pagePosition: shapePageTransform.applyToPoint(point),
				}
			}),
		})

		// update thread terminal bindings eagerly to make sure the threads unbind nicely when translating
		if (bindings.start) {
			updateThreadTerminal({
				editor: this.editor,
				thread: shape,
				terminal: 'start',
				useHandle: true,
			})
			shape = this.editor.getShape(shape.id) as TLThreadShape
		}
		if (bindings.end) {
			updateThreadTerminal({
				editor: this.editor,
				thread: shape,
				terminal: 'end',
				useHandle: true,
			})
		}

		for (const handleName of [ARROW_HANDLES.START, ARROW_HANDLES.END] as const) {
			const binding = bindings[handleName]
			if (!binding) continue

			this.editor.updateBinding({
				...binding,
				props: { ...binding.props, isPrecise: true },
			})
		}

		return
	}

	override onTranslate = (initialShape: TLThreadShape, shape: TLThreadShape) => {
		const atTranslationStart = shapeAtTranslationStart.get(initialShape)
		if (!atTranslationStart) return

		const shapePageTransform = this.editor.getShapePageTransform(shape.id)!
		const pageDelta = Vec.Sub(
			shapePageTransform.applyToPoint(shape),
			atTranslationStart.pagePosition
		)

		for (const terminalBinding of Object.values(atTranslationStart.terminalBindings)) {
			if (!terminalBinding) continue

			const newPagePoint = Vec.Add(terminalBinding.pagePosition, Vec.Mul(pageDelta, 0.5))
			const newTarget = this.editor.getShapeAtPoint(newPagePoint, {
				hitInside: true,
				hitFrameInside: true,
				margin: 0,
				filter: (targetShape) => {
					return (
						!targetShape.isLocked &&
						this.editor.canBindShapes({ fromShape: shape, toShape: targetShape, binding: 'thread' })
					)
				},
			})

			if (newTarget?.id === terminalBinding.binding.toId) {
				const targetBounds = Box.ZeroFix(this.editor.getShapeGeometry(newTarget).bounds)
				const pointInTargetSpace = this.editor.getPointInShapeSpace(newTarget, newPagePoint)
				const normalizedAnchor = {
					x: (pointInTargetSpace.x - targetBounds.minX) / targetBounds.width,
					y: (pointInTargetSpace.y - targetBounds.minY) / targetBounds.height,
				}
				createOrUpdateThreadBinding(this.editor, shape, newTarget.id, {
					...terminalBinding.binding.props,
					normalizedAnchor,
					isPrecise: true,
				})
			} else {
				removeThreadBinding(this.editor, shape, terminalBinding.binding.props.terminal)
			}
		}
	}

	private readonly _resizeInitialBindings = new WeakCache<TLThreadShape, TLThreadBindings>()

	override onResize = (shape: TLThreadShape, info: TLResizeInfo<TLThreadShape>) => {
		const { scaleX, scaleY } = info

		const bindings = this._resizeInitialBindings.get(shape, () =>
			getThreadBindings(this.editor, shape)
		)
		const terminals = getThreadTerminalsInThreadSpace(this.editor, shape, bindings)

		const { start, end } = structuredClone<TLThreadShape['props']>(shape.props)
		let { bend } = shape.props

		// Rescale start handle if it's not bound to a shape
		if (!bindings.start) {
			start.x = terminals.start.x * scaleX
			start.y = terminals.start.y * scaleY
		}

		// Rescale end handle if it's not bound to a shape
		if (!bindings.end) {
			end.x = terminals.end.x * scaleX
			end.y = terminals.end.y * scaleY
		}

		// todo: we should only change the normalized anchor positions
		// of the shape's handles if the bound shape is also being resized

		const mx = Math.abs(scaleX)
		const my = Math.abs(scaleY)

		const startNormalizedAnchor = bindings?.start
			? Vec.From(bindings.start.props.normalizedAnchor)
			: null
		const endNormalizedAnchor = bindings?.end ? Vec.From(bindings.end.props.normalizedAnchor) : null

		if (scaleX < 0 && scaleY >= 0) {
			if (bend !== 0) {
				bend *= -1
				bend *= Math.max(mx, my)
			}

			if (startNormalizedAnchor) {
				startNormalizedAnchor.x = 1 - startNormalizedAnchor.x
			}

			if (endNormalizedAnchor) {
				endNormalizedAnchor.x = 1 - endNormalizedAnchor.x
			}
		} else if (scaleX >= 0 && scaleY < 0) {
			if (bend !== 0) {
				bend *= -1
				bend *= Math.max(mx, my)
			}

			if (startNormalizedAnchor) {
				startNormalizedAnchor.y = 1 - startNormalizedAnchor.y
			}

			if (endNormalizedAnchor) {
				endNormalizedAnchor.y = 1 - endNormalizedAnchor.y
			}
		} else if (scaleX >= 0 && scaleY >= 0) {
			if (bend !== 0) {
				bend *= Math.max(mx, my)
			}
		} else if (scaleX < 0 && scaleY < 0) {
			if (bend !== 0) {
				bend *= Math.max(mx, my)
			}

			if (startNormalizedAnchor) {
				startNormalizedAnchor.x = 1 - startNormalizedAnchor.x
				startNormalizedAnchor.y = 1 - startNormalizedAnchor.y
			}

			if (endNormalizedAnchor) {
				endNormalizedAnchor.x = 1 - endNormalizedAnchor.x
				endNormalizedAnchor.y = 1 - endNormalizedAnchor.y
			}
		}

		if (bindings.start && startNormalizedAnchor) {
			createOrUpdateThreadBinding(this.editor, shape, bindings.start.toId, {
				...bindings.start.props,
				normalizedAnchor: startNormalizedAnchor.toJson(),
			})
		}
		if (bindings.end && endNormalizedAnchor) {
			createOrUpdateThreadBinding(this.editor, shape, bindings.end.toId, {
				...bindings.end.props,
				normalizedAnchor: endNormalizedAnchor.toJson(),
			})
		}

		const next = {
			props: {
				start,
				end,
				bend,
			},
		}

		return next
	}

	override onDoubleClickHandle = (
		shape: TLThreadShape,
		handle: TLHandle
	): TLShapePartial<TLThreadShape> | void => {
		switch (handle.id) {
			case ARROW_HANDLES.START: {
				return {
					id: shape.id,
					type: shape.type,
					props: {
						...shape.props,
						threadheadStart: shape.props.threadheadStart === 'none' ? 'thread' : 'none',
					},
				}
			}
			case ARROW_HANDLES.END: {
				return {
					id: shape.id,
					type: shape.type,
					props: {
						...shape.props,
						threadheadEnd: shape.props.threadheadEnd === 'none' ? 'thread' : 'none',
					},
				}
			}
		}
	}

	component(shape: TLThreadShape) {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const theme = useDefaultColorTheme()
		const onlySelectedShape = this.editor.getOnlySelectedShape()
		const shouldDisplayHandles =
			this.editor.isInAny(
				'select.idle',
				'select.pointing_handle',
				'select.dragging_handle',
				'select.translating',
				'thread.dragging'
			) && !this.editor.getInstanceState().isReadonly

		const info = getThreadInfo(this.editor, shape)
		if (!info?.isValid) return null

		const isSelected = shape.id === this.editor.getOnlySelectedShapeId()
		const isEditing = this.editor.getEditingShapeId() === shape.id

		return (
			<>
				<SVGContainer id={shape.id} style={{ minWidth: 50, minHeight: 50 }}>
					<ThreadSvg
						shape={shape}
						shouldDisplayHandles={shouldDisplayHandles && onlySelectedShape?.id === shape.id}
					/>
				</SVGContainer>
			</>
		)
	}

	indicator(shape: TLThreadShape) {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const isEditing = useIsEditing(shape.id)

		const info = getThreadInfo(this.editor, shape)
		if (!info) return null

		const { start, end } = getThreadTerminalsInThreadSpace(this.editor, shape, info?.bindings)
		const geometry = this.editor.getShapeGeometry<Group2d>(shape)
		const bounds = geometry.bounds

		const labelGeometry = shape.props.text.trim() ? (geometry.children[1] as Rectangle2d) : null

		if (Vec.Equals(start, end)) return null

		const strokeWidth = STROKE_SIZES[shape.props.size] * shape.props.scale

		const as = info.start.threadhead && getThreadheadPathForType(info, 'start', strokeWidth)
		const ae = info.end.threadhead && getThreadheadPathForType(info, 'end', strokeWidth)

		const path = info.isStraight ? getSolidStraightThreadPath(info) : getSolidCurvedThreadPath(info)

		const includeMask =
			(as && info.start.threadhead !== 'thread') ||
			(ae && info.end.threadhead !== 'thread') ||
			!!labelGeometry

		const maskId = (shape.id + '_clip').replace(':', '_')

		if (isEditing && labelGeometry) {
			return (
				<rect
					x={toDomPrecision(labelGeometry.x)}
					y={toDomPrecision(labelGeometry.y)}
					width={labelGeometry.w}
					height={labelGeometry.h}
					rx={3.5 * shape.props.scale}
					ry={3.5 * shape.props.scale}
				/>
			)
		}

		return (
			<g>
				{includeMask && (
					<defs>
						<mask id={maskId}>
							<rect
								x={bounds.minX - 100}
								y={bounds.minY - 100}
								width={bounds.w + 200}
								height={bounds.h + 200}
								fill="white"
							/>
							{labelGeometry && (
								<rect
									x={toDomPrecision(labelGeometry.x)}
									y={toDomPrecision(labelGeometry.y)}
									width={labelGeometry.w}
									height={labelGeometry.h}
									fill="black"
									rx={3.5 * shape.props.scale}
									ry={3.5 * shape.props.scale}
								/>
							)}
							{as && (
								<path
									d={as}
									fill={info.start.threadhead === 'thread' ? 'none' : 'black'}
									stroke="none"
								/>
							)}
							{ae && (
								<path
									d={ae}
									fill={info.end.threadhead === 'thread' ? 'none' : 'black'}
									stroke="none"
								/>
							)}
						</mask>
					</defs>
				)}
				{/* firefox will clip if you provide a maskURL even if there is no mask matching that URL in the DOM */}
				<g {...(includeMask ? { mask: `url(#${maskId})` } : undefined)}>
					{/* This rect needs to be here if we're creating a mask due to an svg quirk on Chrome */}
					{includeMask && (
						<rect
							x={bounds.minX - 100}
							y={bounds.minY - 100}
							width={bounds.width + 200}
							height={bounds.height + 200}
							opacity={0}
						/>
					)}

					<path d={path} />
				</g>
				{as && <path d={as} />}
				{ae && <path d={ae} />}
				{labelGeometry && (
					<rect
						x={toDomPrecision(labelGeometry.x)}
						y={toDomPrecision(labelGeometry.y)}
						width={labelGeometry.w}
						height={labelGeometry.h}
						rx={3.5}
						ry={3.5}
					/>
				)}
			</g>
		)
	}

	override onEditEnd = (shape: TLThreadShape) => {
		const {
			id,
			type,
			props: { text },
		} = shape

		if (text.trimEnd() !== shape.props.text) {
			this.editor.updateShapes<TLThreadShape>([
				{
					id,
					type,
					props: {
						text: text.trimEnd(),
					},
				},
			])
		}
	}

	// override toSvg(shape: TLThreadShape, ctx: SvgExportContext) {
	// 	ctx.addExportDef(getFillDefForExport(shape.props.fill))
	// 	if (shape.props.text) ctx.addExportDef(getFontDefForExport(shape.props.font))
	// 	const theme = getDefaultColorTheme(ctx)
	// 	const scaleFactor = 1 / shape.props.scale

	// 	return (
	// 		<g transform={`scale(${scaleFactor})`}>
	// 			<ThreadSvg shape={shape} shouldDisplayHandles={false} />
	// 			<SvgTextLabel
	// 				fontSize={getThreadLabelFontSize(shape)}
	// 				font={shape.props.font}
	// 				align="middle"
	// 				verticalAlign="middle"
	// 				text={shape.props.text}
	// 				threadColor={theme[shape.props.threadColor].solid}
	// 				bounds={getThreadLabelPosition(this.editor, shape).box}
	// 				padding={4 * shape.props.scale}
	// 			/>
	// 		</g>
	// 	)
	// }

	// override getCanvasSvgDefs(): TLShapeUtilCanvasSvgDef[] {
	// 	return [
	// 		getFillDefForCanvas(),
	// 		{
	// 			key: `thread:dot`,
	// 			component: ThreadheadDotDef,
	// 		},
	// 		{
	// 			key: `thread:cross`,
	// 			component: ThreadheadCrossDef,
	// 		},
	// 	]
	// }


	override getInterpolatedProps(
		startShape: TLThreadShape,
		endShape: TLThreadShape,
		progress: number
	): TLThreadShapeProps {
		return {
			...(progress > 0.5 ? endShape.props : startShape.props),
			scale: lerp(startShape.props.scale, endShape.props.scale, progress),
			start: {
				x: lerp(startShape.props.start.x, endShape.props.start.x, progress),
				y: lerp(startShape.props.start.y, endShape.props.start.y, progress),
			},
			end: {
				x: lerp(startShape.props.end.x, endShape.props.end.x, progress),
				y: lerp(startShape.props.end.y, endShape.props.end.y, progress),
			},
			bend: lerp(startShape.props.bend, endShape.props.bend, progress),
			labelPosition: lerp(startShape.props.labelPosition, endShape.props.labelPosition, progress),
		}
	}
}

export function getThreadLength(editor: Editor, shape: TLThreadShape): number {
	const info = getThreadInfo(editor, shape)!

	return info.isStraight
		? Vec.Dist(info.start.handle, info.end.handle)
		: Math.abs(info.handleArc.length)
}

const ThreadSvg = track(function ThreadSvg({
	shape,
	shouldDisplayHandles,
}: {
	shape: TLThreadShape
	shouldDisplayHandles: boolean
}) {
	const editor = useEditor()
	const theme = useDefaultColorTheme()
	const info = getThreadInfo(editor, shape)
	const bounds = Box.ZeroFix(editor.getShapeGeometry(shape).bounds)
	const bindings = getThreadBindings(editor, shape)
	const isForceSolid = useValue(
		'force solid',
		() => {
			return editor.getZoomLevel() < 0.2
		},
		[editor]
	)

	const changeIndex = React.useMemo<number>(() => {
		return editor.environment.isSafari ? (globalRenderIndex += 1) : 0
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [shape])

	if (!info?.isValid) return null

	const strokeWidth = 2 // Set stroke width to 2

	const as = info.start.threadhead && getThreadheadPathForType(info, 'start', strokeWidth)
	const ae = info.end.threadhead && getThreadheadPathForType(info, 'end', strokeWidth)

	const path = info.isStraight ? getSolidStraightThreadPath(info) : getSolidCurvedThreadPath(info)

	// Calculate the length of the path for the animation
	const pathLength = info.isStraight ? info.length : Math.abs(info.bodyArc.length)

	// Animation controls
	const controls = useAnimation()

	// Trigger the animation when needed
	useEffect(() => {
		// Example: Trigger the animation when the component mounts
		controls.start({
			pathLength: [0, 1],
			transition: { duration: 1, ease: "easeOut" } // Adjust the duration as needed
		})
	}, [controls])

	let handlePath: null | React.JSX.Element = null

	if (shouldDisplayHandles) {
		const sw = 2 / editor.getZoomLevel()
		const { strokeDasharray, strokeDashoffset } = getPerfectDashProps(
			getThreadLength(editor, shape),
			sw,
			{
				end: 'skip',
				start: 'skip',
				lengthRatio: 2.5,
			}
		)

		handlePath =
			bindings.start || bindings.end ? (
				<path
					className="tl-thread-hint"
					d={info.isStraight ? getStraightThreadHandlePath(info) : getCurvedThreadHandlePath(info)}
					strokeDasharray={strokeDasharray}
					strokeDashoffset={strokeDashoffset}
					strokeWidth={sw}
					markerStart={
						bindings.start
							? bindings.start.props.isExact
								? ''
								: bindings.start.props.isPrecise
									? 'url(#threadhead-cross)'
									: 'url(#threadhead-dot)'
							: ''
					}
					markerEnd={
						bindings.end
							? bindings.end.props.isExact
								? ''
								: bindings.end.props.isPrecise
									? 'url(#threadhead-cross)'
									: 'url(#threadhead-dot)'
							: ''
					}
					opacity={0.16}
				/>
			) : null
	}

	const { strokeDasharray, strokeDashoffset } = getPerfectDashProps(
		info.isStraight ? info.length : Math.abs(info.bodyArc.length),
		strokeWidth,
		{
			style: shape.props.dash,
			forceSolid: isForceSolid,
		}
	)

	const maskId = (shape.id + '_clip_' + changeIndex).replace(':', '_')

	return (
		<>
			<defs>
				<mask id={maskId}>
					<rect
						x={toDomPrecision(-100 + bounds.minX)}
						y={toDomPrecision(-100 + bounds.minY)}
						width={toDomPrecision(bounds.width + 200)}
						height={toDomPrecision(bounds.height + 200)}
						fill="white"
					/>
					{as && (
						<path d={as} fill={info.start.threadhead === 'thread' ? 'none' : 'black'} stroke="none" />
					)}
					{ae && (
						<path d={ae} fill={info.end.threadhead === 'thread' ? 'none' : 'black'} stroke="none" />
					)}
				</mask>
				<filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
					<feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
					<feMerge>
						<feMergeNode in="coloredBlur"/>
						<feMergeNode in="SourceGraphic"/>
					</feMerge>
				</filter>
			</defs>
			<g
				fill="none"
				stroke="white" // Set stroke color to white
				strokeWidth={strokeWidth}
				strokeLinejoin="round"
				strokeLinecap="round"
				pointerEvents="none"
			>
				{handlePath}
				<g mask={`url(#${maskId})`}>
					<rect
						x={toDomPrecision(bounds.minX - 100)}
						y={toDomPrecision(bounds.minY - 100)}
						width={toDomPrecision(bounds.width + 200)}
						height={toDomPrecision(bounds.height + 200)}
						opacity={0}
					/>
					<motion.path
						d={path}
						strokeDasharray={pathLength}
                        strokeDashoffset={pathLength}
						filter="url(#glow)"
						// initial={{ strokeDashoffset: 0, strokeDasharray: "0 1"}}
						animate={controls} // Use animation controls
					/>
				</g>
				{as && shape.props.fill !== 'none' && (
					<ShapeFill
						theme={theme}
						d={as}
						color={shape.props.color}
						fill={shape.props.fill}
						scale={shape.props.scale}
					/>
				)}
				{ae && shape.props.fill !== 'none' && (
					<ShapeFill
						theme={theme}
						d={ae}
						color={shape.props.color}
						fill={shape.props.fill}
						scale={shape.props.scale}
					/>
				)}
				{as && <path d={as} />}
				{ae && <path d={ae} />}
			</g>
		</>
	)
})

const shapeAtTranslationStart = new WeakMap<
	TLThreadShape,
	{
		pagePosition: Vec
		terminalBindings: Record<
			'start' | 'end',
			{
				pagePosition: Vec
				shapePosition: Vec
				binding: TLThreadBinding
			} | null
		>
	}
>()

function ThreadheadDotDef() {
	return (
		<marker id="threadhead-dot" className="tl-thread-hint" refX="3.0" refY="3.0" orient="0">
			<circle cx="3" cy="3" r="2" strokeDasharray="100%" />
		</marker>
	)
}

function ThreadheadCrossDef() {
	return (
		<marker id="threadhead-cross" className="tl-thread-hint" refX="3.0" refY="3.0" orient="auto">
			<line x1="1.5" y1="1.5" x2="4.5" y2="4.5" strokeDasharray="100%" />
			<line x1="1.5" y1="4.5" x2="4.5" y2="1.5" strokeDasharray="100%" />
		</marker>
	)
}