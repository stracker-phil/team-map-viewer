import Papa from 'papaparse';
import { Entity, Claim, Link, EntityType, RelationType } from '../types';

const VALID_ENTITY_TYPES = new Set<string>(['person', 'project', 'squad']);
const VALID_RELATIONS = new Set<string>(['works-on', 'owned-by', 'member-of', 'reports-to', 'role']);

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
    if (!VALID_ENTITY_TYPES.has(row.type)) {
      errors.push(`"${row.id}" has invalid type "${row.type}" — expected person, project, or squad`);
      continue;
    }
    data.push({
      id: row.id.trim(),
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
      errors.push(`Invalid relation "${row.relation}" — expected works-on, owned-by, member-of, or reports-to`);
      continue;
    }
    data.push({
      subject: row.subject.trim(),
      relation: row.relation.trim() as RelationType,
      object: row.object.trim(),
      detail: (row.detail ?? '').trim(),
      source: (row.source ?? '').trim(),
      verified: (row.verified ?? '').trim(),
    });
  }

  return { data, errors };
}

export function parseLinks(csv: string): { data: Link[]; errors: string[] } {
  const result = Papa.parse<Record<string, string>>(csv.trim(), {
    header: true,
    skipEmptyLines: true,
  });

  const errors: string[] = [];
  const data: Link[] = [];

  for (const row of result.data) {
    if (!row.entity_id || !row.type || !row.url || !row.label) {
      errors.push(`Row missing required field (entity_id/type/url/label): ${JSON.stringify(row)}`);
      continue;
    }
    data.push({
      entity_id: row.entity_id.trim(),
      type: row.type.trim(),
      url: row.url.trim(),
      label: row.label.trim(),
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

export function exportLinks(links: Link[]): string {
  return Papa.unparse(links);
}
