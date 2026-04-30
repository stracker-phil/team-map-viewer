# ADR-011: Auto-load sample data in demo mode

**Status:** Accepted

## Context

The deployed app has no bundled real data (by design — see ADR-005). A first-time visitor landing on an empty shell can't evaluate whether the concept works.

## Decision

Sample data lives inline as `SAMPLE_TEAM_JSON` (a JSON string) in `src/sampleData.ts`. When `DataContext` finds no `localStorage` entry, it parses and loads the sample into memory (not localStorage) and sets `isDemo: true`. A dismissible banner in `Layout.tsx` flags demo mode and links to `/import`.

## Consequences

- Fresh visitors immediately see a working app with realistic data.
- Demo data is not persisted — any import replaces it cleanly.
- `src/sampleData.ts` and `data/team.json` contain the same content, duplicated. Updates to samples must be made in both places.
- All sample names are fictional placeholders, matching the "no company data in repo" principle.
