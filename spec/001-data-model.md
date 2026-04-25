# SPEC-001: Data model

**Status:** Established

## Overview

All org information is stored in two flat CSV files. Entities hold identity; claims hold every relationship and fact.

## Entities

Each entity has four fields: `id`, `name`, `type`, `meta`.

- `type` is one of `person`, `project`, or `squad`.
- `meta` is a free-form string whose meaning is type-dependent:
  - person → general role category used for grouping and org chart (e.g. "Developer", "Designer"). **Not** the display title — use a `role` claim for the specific title.
  - project → client name
  - squad → squad kind (e.g. "support"), if any
- Entity IDs are stable slugs used as foreign keys in claims. An entity referenced by a claim but absent from `entities.csv` is silently dropped in all views — no error is shown.

## Claims

Each claim row has six fields: `subject`, `relation`, `object`, `detail`, `source`, `verified`.

- `subject` and `object` are entity IDs, **except** for `role` claims where `object` is a free-text title string.
- `relation` is one of five types (see below).
- `detail` carries role information or sub-type depending on relation (see below).
- `source` is a free-form provenance string (e.g. "Confluence / Team page").
- `verified` is an ISO date string (`YYYY-MM-DD`) recording when the fact was last confirmed. Empty means unverified.

## Relation types

| relation    | subject  | object               | detail meaning                          |
|-------------|----------|----------------------|-----------------------------------------|
| `works-on`  | person   | project entity ID    | role code: `TL`, `PM`, `PO`, `dev`, `QA`, `design` |
| `owned-by`  | project  | squad entity ID      | —                                       |
| `member-of` | person   | squad entity ID      | —                                       |
| `reports-to`| person   | person entity ID     | report type: `EM`, `SL`                 |
| `role`      | person   | free-text title string | — (e.g. "Senior Frontend Developer") |

## Referential integrity

Claims referencing unknown entity IDs are silently skipped during rendering. No validation error is surfaced to the user.
