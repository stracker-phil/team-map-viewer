# SPEC-010: People view

**Status:** Established (updated 2026-04-26 — person rows now use PersonItem with EntityPopup)

## Overview

The People view (`#/roles`) shows the full roster grouped by job title, with filter chips to narrow to a single role.

## Filter chips

- A row of chips appears above the list.
- First chip: "ALL · {total count}" — always visible, active by default.
- One chip per distinct `meta` value found in person entities, showing the role name and count. Chips are ordered by count descending (most-common role first).
- Activating a role chip shows only people with that `meta` value. Clicking the active chip again deactivates it and returns to ALL.
- Only one filter can be active at a time.

## Grouped list

- People are grouped by `meta` (job title). Groups are sorted alphabetically by title.
- Within each group, people appear in the order returned by the filter (insertion order from `entities`).
- Each group shows a heading with the role name and a "ROLE · count" badge.
- Each person row uses `<PersonItem>` (avatar · name link) rendered inside `<ul className="entity-list">`. No staleness indicator — no per-person claim is in scope on this view.
- Hovering any person row shows an `EntityPopup` with that person's detail main column (see ADR-016, SPEC-009).
- When a filter chip is active, only the matching group is shown (there will be exactly one group).

## Empty state

If no person entities exist, shows a "No people yet" empty state with an "Import data" button.
