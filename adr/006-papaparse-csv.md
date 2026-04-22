# ADR-006: PapaParse for CSV I/O

**Status:** Accepted

## Context

CSV parsing needs to handle quoted fields, embedded commas, and header rows correctly. Hand-rolling a parser is error-prone; `String.split(',')` is insufficient.

## Decision

Use `papaparse` 5.4 (`@types/papaparse` for TypeScript). Parsing + validation live in `src/utils/csv.ts`: `parseEntities`, `parseClaims`, `exportEntities`, `exportClaims`. Each parser returns `{ data, errors }` — rows with missing required fields or invalid enum values are skipped and reported to the user in the import UI.

## Consequences

- Robust against real-world CSV quirks.
- ~15 KB added to bundle (acceptable for a data-centric app).
- Validation logic is centralized, not scattered across views.
- `Papa.unparse` used for exports keeps round-trip behaviour consistent.
