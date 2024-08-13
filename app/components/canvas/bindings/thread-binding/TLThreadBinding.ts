import { T } from '@tldraw/validate'
import { VecModel, vecModelValidator } from '@tldraw/tlschema'
import { createBindingPropsMigrationSequence } from '@tldraw/tlschema'
import { RecordProps } from '@tldraw/tlschema'
import { threadShapeVersions } from '../../shapes/thread-shape/threadtypes/TLThreadShape'
import { TLBaseBinding } from '@tldraw/tlschema'

/** @public */
export interface TLThreadBindingProps {
	terminal: 'start' | 'end'
	normalizedAnchor: VecModel
	/**
	 * exact is whether the thread head 'enters' the bound shape to point directly at the binding
	 * anchor point
	 */
	isExact: boolean
	/**
	 * precise is whether to bind to the normalizedAnchor, or to the middle of the shape
	 */
	isPrecise: boolean
}

/** @public */
export const threadBindingProps: RecordProps<TLThreadBinding> = {
	terminal: T.literalEnum('start', 'end'),
	normalizedAnchor: vecModelValidator,
	isExact: T.boolean,
	isPrecise: T.boolean,
}

/** @public */
export type TLThreadBinding = TLBaseBinding<'thread', TLThreadBindingProps>

export const threadBindingVersions = {} as const

/** @public */
export const threadBindingMigrations = createBindingPropsMigrationSequence({
	sequence: [{ dependsOn: [threadShapeVersions.ExtractBindings] }],
})