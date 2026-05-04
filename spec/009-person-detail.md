# SPEC-009: Person detail

**Status:** Established (updated 2026-04-27 — 2-col main layout, stacked people list, squad cards without wrapper card; updated 2026-05-04 — ⌘F in-page filter added)

## Overview

The person detail page (`#/person/:id`) shows a person's squad memberships, project contributions, repo contributions, and their position in the reporting hierarchy.

## Header

Large avatar + name as `h1` + specific role title as italic subtitle (from `role` claim if present, else `entity.meta`). No eyebrow label.

## Layout

Two-column: main content left, `LinksSidebar` right (30%, `background: var(--sidebar-bg)`). Collapses to single column below 768 px.

The main column is rendered by `<PersonDetailMain personId={...} />` — a standalone component also used (in `compact` mode) as the popup content on every `PersonItem`. Hovering a `PersonItem` for 1000 ms shows the compact popup; the full-page layout is only used on the PersonDetail route.

### Main column internal layout

When the person has both left-column content (squads, repos, or people) and right-column content (projects), the main column splits into a two-column grid (`pdm-cols--split`):

- **Left column:** squad memberships → other repos → people (reporting lines)
- **Right column:** projects

If only one side has content, sections stack in a single column. This mirrors the compact popup layout order.

## Sections (main column)

Sections using `pdm-section` render with `background: var(--surface)` card styling in full mode (no background in compact). Empty sections are omitted entirely.

### Squad memberships

Derived from `member-of` claims where the person is the subject.

- Renders one `SquadCard` per squad directly — no additional card wrapper around them (SquadCards have their own card styling).
- Each card shows squad name, meta, and People/Project counts; clicking navigates to `#/squad/:id`.
- Sorted alphabetically by squad name.
- If no squads: section is hidden.

### Projects

Derived from `works-on` claims where the person is the subject **and** the target entity is of type `project`. Claims pointing to `repo` entities via `works-on` are excluded here and appear in Other Repos instead.

- One row per project rendered as `<ProjectItem>`: project name link · optional role detail in uppercase mono · staleness dot.
- Sorted alphabetically by project name.
- If no projects: section is hidden.

### Other Repos

Derived from two sources merged and deduplicated:
1. `contributes-to` claims where the person is the subject and the target is a `repo` entity.
2. `works-on` claims where the target entity resolves to a `repo` (misrouted data — treated as contributions).

- One row per repo rendered as `<RepoItem>`: repo name link · optional detail in uppercase mono · staleness dot.
- Sorted alphabetically by repo name.
- If no repos: section is hidden.

### People

Shows both directions of the reporting line. Hidden if no reporting relationships exist at all.

Rendered as a stacked list in both full and compact mode: each role group shows a sublabel (e.g. "Engineering Manager (EM)") followed by the entity list for that group. This is consistent between modes — no grid layout.

**Reports to (upward):** `reports-to` claims where the person is subject. Grouped by `detail` value. Known labels: `EM` → "Engineering Manager (EM)", `SL` → "Squad Lead (SL)". Each manager rendered as `<PersonItem>`. On the full PersonDetail page, hovering opens a nested popup; inside an EntityPopup (compact mode), nested popups are disabled.

**Manages (downward):** `reports-to` claims where the person is the object. Grouped by `detail`. Known labels: `EM` → "Manages (EM)", `SL` → "Manages (SL)". Reports sorted alphabetically within each group. Each report rendered as `<PersonItem>`. Same popup rules as above — nested popups disabled in compact mode.

### Empty state (whole page)

If all four sections are empty: single card showing "No assignments recorded yet."

## In-page text filter

A `<ListSearch>` field appears between the page header and the detail layout. `⌘F`/`Ctrl+F` focuses it (browser find suppressed). Typing filters all sections simultaneously by entity name (case-insensitive substring):

- **Squads** — matched by squad name.
- **Projects** — matched by project name.
- **Other Repos** — matched by repo name.
- **People** — matched by manager/report name; groups with zero matches are hidden.

The 2-col vs 1-col layout is recomputed based on filtered content — if filtering empties one side, the other side expands to full width. An empty filter (or clearing the field) restores all items. Filter is not applied in compact/popup mode.
