export type EntityType = 'person' | 'project' | 'squad';
export type RelationType = 'works-on' | 'owned-by' | 'member-of' | 'reports-to';
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

export interface AppData {
  entities: Entity[];
  claims: Claim[];
}
