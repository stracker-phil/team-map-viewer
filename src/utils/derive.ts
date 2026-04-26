import { Entity, EntityType, Claim, RelationType } from '../types';

export function entityMap(entities: Entity[]): Map<string, Entity> {
	return new Map(entities.map(e => [e.id, e]));
}

export function byType(entities: Entity[], type: EntityType): Entity[] {
	return entities.filter(e => e.type === type);
}

export function filterClaims(
	claims: Claim[],
	filters: { subject?: string; relation?: RelationType; object?: string },
): Claim[] {
	return claims.filter(c => {
		if (filters.subject !== undefined && c.subject !== filters.subject) return false;
		if (filters.relation !== undefined && c.relation !== filters.relation) return false;
		if (filters.object !== undefined && c.object !== filters.object) return false;
		return true;
	});
}

export function searchEntities(entities: Entity[], query: string): Entity[] {
	const q = query.toLowerCase().trim();
	if (!q) return [];
	const seen = new Set<string>();
	return entities.filter(e => {
		if (seen.has(e.id)) return false;
		seen.add(e.id);
		return (
			e.name.toLowerCase().includes(q) ||
			e.id.toLowerCase().includes(q) ||
			e.meta.toLowerCase().includes(q)
		);
	});
}

export function personRoleMap(claims: Claim[]): Map<string, string> {
	const m = new Map<string, string>();
	filterClaims(claims, { relation: 'role' }).forEach(c => m.set(c.subject, c.object));
	return m;
}
