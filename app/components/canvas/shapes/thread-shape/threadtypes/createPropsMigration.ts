import {
	Migration,
	MigrationId,
	MigrationSequence,
	RecordType,
	StandaloneDependsOn,
	UnknownRecord,
	createMigrationSequence,
} from '@tldraw/store'

export interface TLPropsMigrations {
	readonly sequence: Array<StandaloneDependsOn | TLPropsMigration>
}

export interface TLPropsMigration {
	readonly id: MigrationId
	readonly dependsOn?: MigrationId[]
	// eslint-disable-next-line @typescript-eslint/method-signature-style
	readonly up: (props: any) => any
	/**
	 * If a down migration was deployed more than a couple of months ago it should be safe to retire it.
	 * We only really need them to smooth over the transition between versions, and some folks do keep
	 * browser tabs open for months without refreshing, but at a certain point that kind of behavior is
	 * on them. Plus anyway recently chrome has started to actually kill tabs that are open for too long
	 * rather than just suspending them, so if other browsers follow suit maybe it's less of a concern.
	 *
	 * @public
	 */
	readonly down?: 'none' | 'retired' | ((props: any) => any)
}


export function createPropsMigration<R extends UnknownRecord & { type: string; props: object }>(
	typeName: R['typeName'],
	subType: R['type'],
	m: TLPropsMigration
): Migration {
	return {
		id: m.id,
		dependsOn: m.dependsOn,
		scope: 'record',
		filter: (r) => r.typeName === typeName && (r as R).type === subType,
		up: (record: any) => {
			const result = m.up(record.props)
			if (result) {
				record.props = result
			}
		},
		down:
			typeof m.down === 'function'
				? (record: any) => {
						const result = (m.down as (props: any) => any)(record.props)
						if (result) {
							record.props = result
						}
					}
				: undefined,
	}
}