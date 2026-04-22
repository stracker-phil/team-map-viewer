# ADR-005: localStorage for data persistence

**Status:** Accepted

## Context

Real organizational data must never leave the user's machine. A backend would require auth, hosting, and ongoing maintenance — out of proportion for a monthly-updated viewer.

## Decision

Persist imported data in `localStorage` under key `team-map-v1` as a JSON blob `{entities, claims}`. Implemented in `src/context/DataContext.tsx`. On first load (no stored data), sample data is auto-loaded into a "demo mode" that is not persisted.

## Consequences

- Zero infrastructure — the deployed page is an empty shell until the user imports.
- Data is per-browser-per-device; no sync across devices.
- CSVs in a private Git repo remain the durable source of truth.
- localStorage quota (~5 MB) is ample for ~300 rows.
