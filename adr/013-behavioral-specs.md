# ADR-013: Behavioral specs in `spec/`

**Status:** Accepted

## Context

ADRs document *why* architectural decisions were made. They do not describe *what the system does* from a user or product perspective. As the feature set grew, questions like "what exactly should the squad page dim when a project is hovered?" or "what are the staleness thresholds?" had no single authoritative source — the answer lived only in the code.

## Decision

Introduce a `spec/` directory alongside `adr/`. Each file documents the observable behavior of one area (data model, staleness, a specific view). Files are numbered and named after the thing they describe, not after a decision. Format mirrors ADRs: title, status, prose sections with numbered or tabular expectations.

Specs record **established** behavior — what the running code actually does. They are not roadmap or aspirational documents. When a behavior changes, the relevant spec is updated in the same commit.

## Consequences

- A single place to check "what should this do?" without reading source code.
- Specs can serve as the source of truth when writing prompt context for AI-assisted changes.
- Specs must be kept in sync with code; a stale spec is worse than no spec.
- No spec framework or runner — specs are plain Markdown, verified by reading the code.
