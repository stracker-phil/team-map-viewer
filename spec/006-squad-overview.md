# SPEC-006: Squad overview

**Status:** Established (updated April 2026 — simplified cards, tabs removed; updated 2026-04-27 — hover popup added, dynamic stats; updated 2026-04-27 — star sort + indicator)

## Overview

The home page (`#/`) shows all squads as cards in a 2-column grid.

## Grid layout

- All squads are shown in a 2-column grid with 20 px gap. Starred squads appear first; within each starred/unstarred group, order follows `entities.csv`.
- On screens narrower than 768 px the grid collapses to a single column.

## Squad card

Each card is a clickable button that navigates to `#/squad/:id` on click. Hovering for 1000 ms opens an `EntityPopup` showing `SquadDetailMain` in compact mode — members grouped by role and owned projects with ≥1 member. The popup title row is a nav link to the squad detail page.

The card shows:
- Squad `meta` as a small uppercase monospace label above the name (only if `meta` is non-empty).
- Squad name in Fraunces serif, prefixed with an amber `StarIndicator` when the squad is starred.
- A stats line: `{N} People · {M} Projects` in uppercase monospace. People = count of `member-of` claims; Projects = count of `owned-by` projects with ≥1 `works-on` member. Stats items are dynamic — items with 0 count are omitted.

There are no tabs, no expanded member or project lists inline. The squad detail page is the place for the full roster.

## Empty state

If no squad entities exist, shows "No teams yet" with an "Import data" button.

## Reusability

The `SquadCard` component (`src/components/SquadCard.tsx`) is shared between the overview grid and the person detail page (where a person's squad memberships are shown as full squad cards).
