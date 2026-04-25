# SPEC-006: Squad overview

**Status:** Established

## Overview

The home page (`#/`) shows all squads as cards in a 2-column grid. Each card lets the user toggle between a People view and a Projects view.

## Grid layout

- All squads are shown in a 2-column grid, sorted in the order they appear in `entities.csv`.
- On screens narrower than 768 px the grid collapses to a single column.

## Squad card

Each card shows:
- Squad `meta` as an eyebrow label (e.g. "support") if non-empty.
- Squad name as a large clickable heading that navigates to the squad detail page.
- A tab bar with **PEOPLE** tab always visible, and **PROJECTS** tab only if the squad has at least one project with `works-on` members.

### Tab: People (default)

- Active by default when the card first renders.
- Lists all `member-of` claims for that squad, one person per line.
- Each row: avatar · name · staleness dot (from `member-of` claim's `verified` date) · role title in muted monospace. Role title is taken from the person's `role` claim if present, otherwise falls back to `entity.meta`.
- Sorted alphabetically by person name.

### Tab: Projects

- Only shown when the squad has ≥1 project with at least one `works-on` member (projects with 0 members are hidden everywhere).
- Lists all `owned-by` claims where the squad is the object, filtered to projects with ≥1 `works-on` member, one project per line.
- Each row: chevron icon · project name · project meta (client) in muted monospace.
- Sorted alphabetically by project name.

### Empty states

- "No members recorded yet." when the People tab has no data.

## Tab persistence

Tab state is local to each card and is not persisted. Navigating away and back resets all cards to the People tab.
