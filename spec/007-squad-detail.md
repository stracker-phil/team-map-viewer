# SPEC-007: Squad detail

**Status:** Established (updated 2026-04-26 — removed cross-highlight dim interaction; replaced by EntityPopup hover drill-down on PersonItem)

## Overview

The squad detail page (`#/squad/:id`) shows a squad's full roster and project portfolio in a three-column layout.

## Layout

Three columns:
1. **People** — all `member-of` claims for the squad.
2. **Projects** — all `owned-by` claims where the squad is the object.
3. **Links** — `LinksSidebar` for the squad entity (same 30% width as on other detail pages).

On screens narrower than 768 px the three columns stack vertically.

## People column

- Heading: "PEOPLE · {count}" in monospace.
- Members are grouped by job title (`person.meta`). Groups sorted alphabetically by title. Members within each group sorted alphabetically by name.
- Group label renders as a small monospace section label above the list.
- Each person row: avatar · name link · staleness dot (from `member-of` claim).
- People with no `meta` are grouped under "Other".
- Hovering any person row shows an `EntityPopup` with that person's detail main column (see ADR-016, SPEC-009).

## Projects column

- Heading: "PROJECTS · {count}" in monospace.
- One project per line: project name link · staleness dot (from `owned-by` claim).
- Sorted alphabetically by project name.

## No cross-highlight interaction

The hover-dim cross-highlight between people and projects (previously: hovering a person dimmed unrelated projects) has been removed. Discovery is now served by the EntityPopup hover drill-down on PersonItem.
