import { createMigrationSequence } from '@tldraw/store'
import { T } from '@tldraw/validate'
import { TLThreadBinding } from '../../../bindings/thread-binding/TLThreadBinding'
import { VecModel, vecModelValidator } from '@tldraw/tlschema'
import { createBindingId } from '@tldraw/tlschema'
import { TLShapeId, createShapePropsMigrationIds } from '@tldraw/tlschema'
import { RecordProps, TLPropsMigration } from '@tldraw/tlschema'
import { createPropsMigration } from './createPropsMigration'
import { StyleProp } from '@tldraw/tlschema'
import {
	DefaultColorStyle,
	// DefaultThreadColorStyle,
	TLDefaultColorStyle,
	defaultColorNames,
} from '@tldraw/tlschema'

export const DefaultThreadColorStyle = StyleProp.defineEnum('tldraw:threadColor', {
	defaultValue: 'black',
	values: defaultColorNames,
})

import { DefaultDashStyle, TLDefaultDashStyle } from '@tldraw/tlschema'
import { DefaultFillStyle, TLDefaultFillStyle } from '@tldraw/tlschema'
import { DefaultFontStyle, TLDefaultFontStyle } from '@tldraw/tlschema'
import { DefaultSizeStyle, TLDefaultSizeStyle } from '@tldraw/tlschema'
import { TLBaseShape } from '@tldraw/tlschema'




const threadheadTypes = [
	'thread',
	'triangle',
	'square',
	'dot',
	'pipe',
	'diamond',
	'inverted',
	'bar',
	'none',
] as const

/** @public */
export const ThreadShapeThreadheadStartStyle = StyleProp.defineEnum('tldraw:threadheadStart', {
	defaultValue: 'none',
	values: threadheadTypes,
})

/** @public */
export const ThreadShapeThreadheadEndStyle = StyleProp.defineEnum('tldraw:threadheadEnd', {
	defaultValue: 'thread',
	values: threadheadTypes,
})

/** @public */
export type TLThreadShapeThreadheadStyle = T.TypeOf<typeof ThreadShapeThreadheadStartStyle>

/** @public */
export interface TLThreadShapeProps {
	threadColor: TLDefaultColorStyle
	color: TLDefaultColorStyle
	fill: TLDefaultFillStyle
	dash: TLDefaultDashStyle
	size: TLDefaultSizeStyle
	threadheadStart: TLThreadShapeThreadheadStyle
	threadheadEnd: TLThreadShapeThreadheadStyle
	font: TLDefaultFontStyle
	start: VecModel
	end: VecModel
	bend: number
	text: string
	labelPosition: number
	scale: number
}

/** @public */
export type TLThreadShape = TLBaseShape<'thread', TLThreadShapeProps>

/** @public */
export const threadShapeProps: RecordProps<TLThreadShape> = {
	threadColor: DefaultThreadColorStyle,
	color: DefaultColorStyle,
	fill: DefaultFillStyle,
	dash: DefaultDashStyle,
	size: DefaultSizeStyle,
	threadheadStart: ThreadShapeThreadheadStartStyle,
	threadheadEnd: ThreadShapeThreadheadEndStyle,
	font: DefaultFontStyle,
	start: vecModelValidator,
	end: vecModelValidator,
	bend: T.number,
	text: T.string,
	labelPosition: T.number,
	scale: T.nonZeroNumber,
}

export const threadShapeVersions = createShapePropsMigrationIds('thread', {
	AddThreadColor: 1,
	AddIsPrecise: 2,
	AddLabelPosition: 3,
	ExtractBindings: 4,
	AddScale: 5,
})

function propsMigration(migration: TLPropsMigration) {
	return createPropsMigration<TLThreadShape>('shape', 'thread', migration)
}

/** @public */
export const threadShapeMigrations = createMigrationSequence({
	sequenceId: 'com.tldraw.shape.thread',
	retroactive: false,
	sequence: [
		propsMigration({
			id: threadShapeVersions.AddThreadColor,
			up: (props) => {
				props.threadColor = 'black'
			},
			down: 'retired',
		}),

		propsMigration({
			id: threadShapeVersions.AddIsPrecise,
			up: ({ start, end }) => {
				if (start.type === 'binding') {
					start.isPrecise = !(start.normalizedAnchor.x === 0.5 && start.normalizedAnchor.y === 0.5)
				}
				if (end.type === 'binding') {
					end.isPrecise = !(end.normalizedAnchor.x === 0.5 && end.normalizedAnchor.y === 0.5)
				}
			},
			down: ({ start, end }) => {
				if (start.type === 'binding') {
					if (!start.isPrecise) {
						start.normalizedAnchor = { x: 0.5, y: 0.5 }
					}
					delete start.isPrecise
				}
				if (end.type === 'binding') {
					if (!end.isPrecise) {
						end.normalizedAnchor = { x: 0.5, y: 0.5 }
					}
					delete end.isPrecise
				}
			},
		}),

		propsMigration({
			id: threadShapeVersions.AddLabelPosition,
			up: (props) => {
				props.labelPosition = 0.5
			},
			down: (props) => {
				delete props.labelPosition
			},
		}),

		{
			id: threadShapeVersions.ExtractBindings,
			scope: 'store',
			up: (oldStore) => {
				type OldThreadTerminal =
					| {
							type: 'point'
							x: number
							y: number
					  }
					| {
							type: 'binding'
							boundShapeId: TLShapeId
							normalizedAnchor: VecModel
							isExact: boolean
							isPrecise: boolean
					  }
					// new type:
					| { type?: undefined; x: number; y: number }

				type OldThread = TLBaseShape<'thread', { start: OldThreadTerminal; end: OldThreadTerminal }>

				const threads = Object.values(oldStore).filter(
					(r: any): r is OldThread => r.typeName === 'shape' && r.type === 'thread'
				)

				for (const thread of threads) {
					const { start, end } = thread.props
					if (start.type === 'binding') {
						const id = createBindingId()
						const binding: TLThreadBinding = {
							typeName: 'binding',
							id,
							type: 'thread',
							fromId: thread.id,
							toId: start.boundShapeId,
							meta: {},
							props: {
								terminal: 'start',
								normalizedAnchor: start.normalizedAnchor,
								isExact: start.isExact,
								isPrecise: start.isPrecise,
							},
						}

						oldStore[id] = binding
						thread.props.start = { x: 0, y: 0 }
					} else {
						delete thread.props.start.type
					}
					if (end.type === 'binding') {
						const id = createBindingId()
						const binding: TLThreadBinding = {
							typeName: 'binding',
							id,
							type: 'thread',
							fromId: thread.id,
							toId: end.boundShapeId,
							meta: {},
							props: {
								terminal: 'end',
								normalizedAnchor: end.normalizedAnchor,
								isExact: end.isExact,
								isPrecise: end.isPrecise,
							},
						}

						oldStore[id] = binding
						thread.props.end = { x: 0, y: 0 }
					} else {
						delete thread.props.end.type
					}
				}
			},
		},
		propsMigration({
			id: threadShapeVersions.AddScale,
			up: (props) => {
				props.scale = 1
			},
			down: (props) => {
				delete props.scale
			},
		}),
	],
})