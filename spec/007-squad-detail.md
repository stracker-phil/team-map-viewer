# SPEC-007: Squad detail

**Status:** Established (updated 2026-04-27 — added Repos section below Projects; removed cross-highlight dim interaction 2026-04-26)

## Overview

The squad detail page (`#/squad/:id`) shows a squad's full roster, project portfolio, and owned repos in a three-column layout.

## Layout

Three columns:
1. **People** — all `member-of` claims for the squad.
2. **Projects + Repos** — projects owned by the squad, then repos owned by the squad (stacked, 1 rem gap).
3. **Links** — `LinksSidebar` for the squad entity (same 30% width as on other detail pages).

On screens narrower than 768 px the three columns stack vertically.

## People column

- Heading: "PEOPLE · {count}" in monospace.
- Members are grouped by job title (`person.meta`). Groups sorted alphabetically by title. Members within each group sorted alphabetically by name.
- Group label renders as a small monospace section label above the list.
- Each person row: avatar · name link · staleness dot (from `member-of` claim).
- People with no `meta` are grouped under "Other".
- Hovering any person row shows an `EntityPopup` with that person's detail main column (see ADR-016, SPEC-009).

## Projects section (column 2, top)

- Heading: "PROJECTS · {count}" in monospace.
- One project per line: project name link · staleness dot (from `owned-by` claim).
- Only projects with at least one `works-on` member are shown (same rule as all other project lists).
- Sorted starred-first, then alphabetically by name.

## Repos section (column 2, below Projects)

- Heading: "REPOS · {count}" in monospace.
- Hidden entirely when count is zero.
- Repos included if they meet **either** condition:
  1. Direct `owned-by` claim pointing to the squad.
  2. `belongs-to` claim pointing to any project owned by the squad.
- Deduped by repo ID.
- Sorted starred-first, then alphabetically by name.

## No cross-highlight interaction

The hover-dim cross-highlight between people and projects (previously: hovering a person dimmed unrelated projects) has been removed. Discovery is now served by the EntityPopup hover drill-down on PersonItem.
