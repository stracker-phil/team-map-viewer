# ADR-004: Two-CSV data model (entities + claims)

**Status:** Accepted

## Context

Org data goes stale unevenly — a person's team membership may hold while their project assignment changes. Storing all facts on entity rows couples the verification lifecycle of independent facts.

## Decision

Split data into `entities.csv` (id, name, type, meta) and `claims.csv` (subject, relation, object, detail, source, verified). Entities carry zero structural information; every relationship is a standalone row in claims with its own `source` and `verified` date. Relation types: `works-on`, `owned-by`, `member-of`, `reports-to`.

## Consequences

- Staleness is per-fact, not per-entity — a stale project assignment doesn't flag the whole person.
- Multi-team membership, multiple project roles: just add more claim rows. No schema change.
- Two files to keep in sync — claims referencing missing entity IDs are silently dropped in views (graceful but hides errors).
- Git diffs on `claims.csv` serve as the changelog.
