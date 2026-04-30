# src/utils

## derive.ts

- **filterClaims:** `filterClaims(claims, { subject?, relation?, object? })` — always use this, never re-implement filter logic inline.
- `byType`, `searchEntities` — general helpers. `entityMap` and `personRoleMap` live in DataContext, not here.

## stale.ts

`staleDays(verified)`, `staleLevel(days)`, `staleLabel(level)` — consumed by `StaleTag` component. Thresholds: teal ≤30d, amber 30–60d, orange 60–90d, red >90d. See [SPEC-002](../../spec/002-staleness.md).

## csv.ts

`parseTeamJson` — parses JSON, strips `repo/` prefix from IDs and claims, validates structure.  
`exportTeamJson` — serializes current data back to JSON. Used only to populate the import textarea for review/copy — there is no export button. See [ADR-014](../../adr/014-static-read-only-viewer.md).
