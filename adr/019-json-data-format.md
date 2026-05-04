# ADR-019: Single team.json data format

**Status:** Accepted

## Context

The app previously received org data as two separate CSV files (`entities.csv` and `claims.csv`). Upstream data pipelines now produce a single `team.json` file combining both. Maintaining two-file import/export was unnecessary complexity when a single file is available.

## Decision

Replace the two-CSV format with a single `team.json` file. Top-level structure:

```json
{
  "config": { ... },
  "entities": [
    { "id": "...", "name": "...", "type": "...", "meta": "..." }
  ],
  "claims": [
    { "subject": "...", "relation": "...", "object": "...", "detail": "...", "source": "...", "verified": "..." }
  ]
}
```

`config` is optional — see [ADR-020](020-config-block.md) for its shape and runtime behaviour. The logical data model (entities + claims, same fields and relation types) is unchanged.

`src/utils/csv.ts` now exports `parseTeamJson(json: string)` and `exportTeamJson(entities, claims)` using native `JSON.parse`/`JSON.stringify` — PapaParse removed. The `repo/` prefix stripping convention is preserved in the JSON parser.

`src/sampleData.ts` exports a single `SAMPLE_TEAM_JSON` string. `data/team.json` replaces `data/entities.csv` and `data/claims.csv` as the template data file.

The import UI (`ImportData.tsx`) is reduced to one full-width textarea accepting JSON content, with a single file-upload input (`.json`).

## Consequences

- One file to maintain and pass around — simpler for upstream tooling and for users copying data.
- PapaParse removed from bundle (~15 KB savings).
- Native JSON parse: no CSV quoting/escaping edge cases.
- Validation logic unchanged in structure (`{ data, errors }` → `{ entities, claims, errors }`).
- Existing `localStorage` data (`team-map-v1`) is already stored as JSON `AppData` — no migration needed.
