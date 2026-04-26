# ADR-004: Two-CSV data model (entities + claims)

**Status:** Accepted

## Context

Org data goes stale unevenly — a person's team membership may hold while their project assignment changes. Storing all facts on entity rows couples the verification lifecycle of independent facts.

## Decision

Split data into `entities.csv` (id, name, type, meta) and `claims.csv` (subject, relation, object, detail, source, verified). Entities carry zero structural information; every relationship is a standalone row in claims with its own `source` and `verified` date. Relation types: `works-on`, `owned-by`, `member-of`, `reports-to`, `role`, `contributes-to`.

**Amendment (2026-04-25):** Added `role` relation type. For a `role` claim, `subject` is a person entity ID and `object` is a free-text specific job title (e.g. "Senior Frontend Developer"). This separates the *general category* stored in `person.meta` (used for grouping and org chart) from the *specific display title* used in person headers and list items.

**Amendment (2026-04-26):** Added `repo` entity type and `contributes-to` relation type. A `repo` entity represents a GitHub repository. A `contributes-to` claim records that a person (`subject`) contributes to a repo entity (`object`). Unlike `works-on` (Jira projects), `contributes-to` targets `repo` entities which have their own detail page at `#/repo/:id`.

**Convention (2026-04-26):** Repo entity names follow the `org/repo` format matching a GitHub repository slug (e.g. `acme/api-server`). `LinksSidebar` detects this pattern with `/^[^/]+\/[^/]+$/` and auto-generates a `https://github.com/org/repo` link shown in the GitHub section, without requiring an explicit `link` claim. Names not matching this pattern are displayed as-is with no auto-link.

**Amendment (2026-04-27a):** Removed `links.csv` as a separate file. External links are now `link` claims in `claims.csv`. For a `link` claim: `subject` = entity ID, `object` = full URL, `detail` = display label, `source` = link group key (`jira`, `slack`, `confluence`, `github`, `website`, `wporg`, `personio`, or any custom string). The `Link` type and `parseLinks`/`exportLinks` functions have been removed; `AppData` no longer carries a `links` array; import UI drops the third panel. `LinksSidebar` now reads from `claims` filtered by `relation === 'link'`.

**Amendment (2026-04-27b):** Added `belongs-to` relation type. A `belongs-to` claim records that a repo entity (`subject`) belongs to a project entity (`object`). This connects repos to the project they are part of. On the project detail page, a "Repos" section lists all repos with a `belongs-to` claim pointing to that project. On the repo detail page, a "Projects" section lists all projects the repo belongs to. Both sections appear only when at least one `belongs-to` claim exists.

**Convention (2026-04-27b):** The CSV parser silently strips a `repo/` prefix from entity IDs and from `subject`/`object` fields in claims at import time. This guards against ID collisions between repo and project entities in source data that uses the prefix as a namespace — the prefix never enters the app's data context or URLs.

## Consequences

- Staleness is per-fact, not per-entity — a stale project assignment doesn't flag the whole person.
- Multi-team membership, multiple project roles: just add more claim rows. No schema change.
- Two files to keep in sync — claims referencing missing entity IDs are silently dropped in views (graceful but hides errors).
- Git diffs on `claims.csv` serve as the changelog.
