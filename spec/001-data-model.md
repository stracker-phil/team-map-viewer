# SPEC-001: Data model

**Status:** Established

## Overview

All org information is stored in a single `team.json` file with top-level `entities` and `claims` arrays. Entities hold identity; claims hold every relationship and fact.

## Entities

Each entity has four fields: `id`, `name`, `type`, `meta`.

- `type` is one of `person`, `project`, `squad`, or `repo`. Other type values are accepted without error — those entities are stored and can carry claims and links, but have no dedicated view or route.
- `meta` is a free-form string whose meaning is type-dependent:
  - person → general role category used for grouping and org chart (e.g. "Developer", "Designer"). **Not** the display title — use a `role` claim for the specific title.
  - project → client name
  - squad → squad kind (e.g. "support"), if any
  - repo → short description of the repository's purpose
- Entity IDs are stable slugs used as foreign keys in claims. An entity referenced by a claim but absent from the entities array is silently dropped in all views — no error is shown.

## Claims

Each claim row has six fields: `subject`, `relation`, `object`, `detail`, `source`, `verified`.

- `subject` and `object` are entity IDs, **except** for `role` claims where `object` is a free-text title string, and `link` claims where `object` is a full URL.
- `relation` is one of the types listed below.
- `detail` carries role information, link label, or sub-type depending on relation (see below).
- `source` is a free-form provenance string (e.g. "Confluence / Team page"), **except** for `link` claims where it is the link group key.
- `verified` is an ISO date string (`YYYY-MM-DD`) recording when the fact was last confirmed. Empty means unverified.

## Relation types

| relation         | subject      | object               | detail meaning                          | source meaning        |
|------------------|--------------|----------------------|-----------------------------------------|-----------------------|
| `works-on`       | person       | project entity ID    | role code: `TL`, `PM`, `PO`, `dev`, `QA`, `design` | provenance |
| `owned-by`       | project      | squad entity ID      | —                                       | provenance            |
| `member-of`      | person       | squad entity ID      | —                                       | provenance            |
| `reports-to`     | person       | person entity ID     | report type: `EM`, `SL`                 | provenance            |
| `role`           | person       | free-text title string | —                                     | provenance            |
| `contributes-to` | person       | repo entity ID       | optional free-text                      | provenance            |
| `belongs-to`     | repo         | project entity ID    | —                                       | provenance            |
| `link`           | any entity   | full URL             | display label                           | link group key (see below) |

### Link group keys

`jira` · `slack` · `confluence` · `github` · `website` · `wporg` · `personio` · any custom string

## Import: `repo/` prefix stripping

`parseTeamJson` silently strips a `repo/` prefix from entity IDs and from `subject`/`object` fields in claims at import time. This is an internal convention in some source data that namespaces repo IDs to avoid collisions — the prefix never enters the app's data context or URLs.

## Referential integrity

Claims referencing unknown entity IDs are silently skipped during rendering. No validation error is surfaced to the user.
