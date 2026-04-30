export type EntityType = 'person' | 'project' | 'squad' | 'repo';
export type RelationType =
	'works-on'
	| 'owned-by'
	| 'member-of'
	| 'reports-to'
	| 'role'
	| 'contributes-to'
	| 'link'
	| 'belongs-to';
export type StaleLevel = 'fresh' | 'warn' | 'old' | 'stale';

export interface Entity {
	id: string;
	name: string;
	type: EntityType;
	meta: string;
}

export interface Claim {
	subject: string;
	relation: RelationType;
	object: string;
	detail: string;
	source: string;
	verified: string;
}

export interface AppConfig {
	brand?: {
		name?: string;
	};
	pages?: {
		squads?: { description?: string };
		people?: { description?: string };
		projects?: { description?: string };
		repos?: { description?: string };
	};
	theme?: {
		colors?: {
			bg?: string;
			surface?: string;
			sidebarBg?: string;
			accent?: string;
			text?: string;
			muted?: string;
		};
	};
	footer?: {
		text?: string;
		builtAt?: string;
	};
}

export interface AppData {
	config?: AppConfig;
	entities: Entity[];
	claims: Claim[];
}
