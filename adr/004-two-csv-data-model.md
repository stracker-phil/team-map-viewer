# ADR-004: Two-CSV data model (entities + claims)

**Status:** Accepted

## Context

Org data goes stale unevenly — a person's team membership may hold while their project assignment changes. Storing all facts on entity rows couples the verification lifecycle of independent facts.

## Decision

Split data into `entities.csv` (id, name, type, meta) and `claims.csv` (subject, relation, object, detail, source, verified). Entities carry zero structural information; every relationship is a standalone row in claims with its own `source` and `verified` date. Relation types: `works-on`, `owned-by`, `member-of`, `reports-to`, `role`.

**Amendment (2026-04-25):** Added `role` relation type. For a `role` claim, `subject` is a person entity ID and `object` is a free-text specific job title (e.g. "Senior Frontend Developer"). This separates the *general category* stored in `person.meta` (used for grouping and org chart) from the *specific display title* used in person headers and list items.

## Consequences

- Staleness is per-fact, not per-entity — a stale project assignment doesn't flag the whole person.
- Multi-team membership, multiple project roles: just add more claim rows. No schema change.
- Two files to keep in sync — claims referencing missing entity IDs are silently dropped in views (graceful but hides errors).
- Git diffs on `claims.csv` serve as the changelog.
