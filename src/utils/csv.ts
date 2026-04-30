import { Entity, Claim, AppConfig, EntityType, RelationType } from '../types';

const VALID_RELATIONS = new Set<string>([
  'works-on', 'owned-by', 'member-of', 'reports-to',
  'role', 'contributes-to', 'link', 'belongs-to',
]);

const stripRepo = (s: string) => s.startsWith('repo/') ? s.slice(5) : s;

export function parseTeamJson(json: string): { entities: Entity[]; claims: Claim[]; config?: AppConfig; errors: string[] } {
  const errors: string[] = [];
  let parsed: { entities?: unknown[]; claims?: unknown[]; config?: AppConfig };

  try {
    parsed = JSON.parse(json) as typeof parsed;
  } catch (e) {
    return { entities: [], claims: [], errors: [`Invalid JSON: ${String(e)}`] };
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return { entities: [], claims: [], errors: ['JSON must be an object with "entities" and "claims" arrays'] };
  }

  const entities: Entity[] = [];
  for (const row of ((parsed.entities ?? []) as Record<string, string>[])) {
    if (!row.id || !row.name || !row.type) {
      errors.push(`Entity missing required field (id/name/type): ${JSON.stringify(row)}`);
      continue;
    }
    const rawId = row.id.trim();
    entities.push({
      id: rawId.startsWith('repo/') ? rawId.slice(5) : rawId,
      name: row.name.trim(),
      type: row.type.trim() as EntityType,
      meta: (row.meta ?? '').trim(),
    });
  }

  const claims: Claim[] = [];
  for (const row of ((parsed.claims ?? []) as Record<string, string>[])) {
    if (!row.subject || !row.relation || !row.object) {
      errors.push(`Claim missing required field (subject/relation/object): ${JSON.stringify(row)}`);
      continue;
    }
    if (!VALID_RELATIONS.has(row.relation)) {
      errors.push(`Invalid relation "${row.relation}" — expected works-on, owned-by, member-of, reports-to, role, contributes-to, link, or belongs-to`);
      continue;
    }
    claims.push({
      subject: stripRepo(row.subject.trim()),
      relation: row.relation.trim() as RelationType,
      object: stripRepo(row.object.trim()),
      detail: (row.detail ?? '').trim(),
      source: (row.source ?? '').trim(),
      verified: (row.verified ?? '').trim(),
    });
  }

  const config = (parsed as { config?: AppConfig }).config;

  return { entities, claims, config, errors };
}

export function exportTeamJson(entities: Entity[], claims: Claim[], config?: AppConfig): string {
  const obj: Record<string, unknown> = config ? { config, entities, claims } : { entities, claims };
  return JSON.stringify(obj, null, 2);
}
