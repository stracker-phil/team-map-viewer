import Papa from 'papaparse';
import { Entity, Claim, EntityType, RelationType } from '../types';

const VALID_RELATIONS = new Set<string>(['works-on', 'owned-by', 'member-of', 'reports-to', 'role', 'contributes-to', 'link', 'belongs-to']);

export function parseEntities(csv: string): { data: Entity[]; errors: string[] } {
	const result = Papa.parse<Record<string, string>>(csv.trim(), {
		header: true,
		skipEmptyLines: true,
	});

	const errors: string[] = [];
	const data: Entity[] = [];

	for (const row of result.data) {
		if (!row.id || !row.name || !row.type) {
			errors.push(`Row missing required field (id/name/type): ${JSON.stringify(row)}`);
			continue;
		}
		const rawId = row.id.trim();
		data.push({
			id: rawId.startsWith('repo/') ? rawId.slice(5) : rawId,
			name: row.name.trim(),
			type: row.type.trim() as EntityType,
			meta: (row.meta ?? '').trim(),
		});
	}

	return { data, errors };
}

export function parseClaims(csv: string): { data: Claim[]; errors: string[] } {
	const result = Papa.parse<Record<string, string>>(csv.trim(), {
		header: true,
		skipEmptyLines: true,
	});

	const errors: string[] = [];
	const data: Claim[] = [];

	for (const row of result.data) {
		if (!row.subject || !row.relation || !row.object) {
			errors.push(`Row missing required field (subject/relation/object): ${JSON.stringify(row)}`);
			continue;
		}
		if (!VALID_RELATIONS.has(row.relation)) {
			errors.push(`Invalid relation "${row.relation}" — expected works-on, owned-by, member-of, reports-to, role, contributes-to, link, or belongs-to`);
			continue;
		}
		const stripRepo = (s: string) => s.startsWith('repo/') ? s.slice(5) : s;
		data.push({
			subject: stripRepo(row.subject.trim()),
			relation: row.relation.trim() as RelationType,
			object: stripRepo(row.object.trim()),
			detail: (row.detail ?? '').trim(),
			source: (row.source ?? '').trim(),
			verified: (row.verified ?? '').trim(),
		});
	}

	return { data, errors };
}

export function exportEntities(entities: Entity[]): string {
	return Papa.unparse(entities);
}

export function exportClaims(claims: Claim[]): string {
	return Papa.unparse(claims);
}
