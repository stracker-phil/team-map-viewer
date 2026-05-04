# SPEC-008: Project detail

**Status:** Established (updated 2026-04-27 — ProjectDetailMain extraction, ProjectItem hover popup, mobile people fallback uses PersonItem; owner now SquadCard; Repos section added; updated 2026-05-04 — ⌘F in-page filter added)

## Overview

The project detail page (`#/project/:id`) shows a project's owning squad, its team structure as an org chart, and source provenance. The main column is rendered by `<ProjectDetailMain projectId={...} />` — also used (in `compact` mode) as the hover popup on every `ProjectItem`.

## Header

- Eyebrow: "PROJECT".
- Title: project name.
- Sub-title: "Client: {meta}" if `meta` is non-empty.

## Owner section

Shows the owning squad as a `SquadCard` (name + member count + project count, clickable → squad detail). If no `owned-by` claim exists for the project, displays "No owner recorded yet."

## Repos section

If any `belongs-to` claims exist with this project as `object`, a "Repos" section appears immediately after the owner. Lists each repo as a `RepoItem`. Hidden when no repos are linked.

## Org chart (desktop)

On screens 640 px and wider, the team is shown as a visual org chart. The hierarchy has up to three levels:

1. **Team Lead (TL)** — top row. Rendered as medium-size nodes.
2. **Project Manager / Product Owner (PM, PO)** — middle row, below TL. Rendered as medium-size nodes.
3. **Engineering / QA / Design (dev, QA, design)** — branch columns at the bottom, each in its own labeled column with small-size nodes.

Connector lines (vertical stems and a horizontal top-border) link the levels visually. If a level is absent, the chart collapses gracefully — e.g. a project with only TL and dev produces a two-level chart with no PM row.

Within each level/column, people are sorted alphabetically by name.

## Mobile fallback (< 640 px)

The org chart is hidden. A stacked list grouped by role replaces it. Role order: TL → PM → PO → dev → QA → design → (other). Each group shows a sublabel followed by a `PersonItem` list (same as the compact popup layout).

## Sources

If any claim for the project has a non-empty `source`, a de-emphasized "SOURCES" block appears below the people section listing each unique source string and how many claims cite it.

## In-page text filter

A `<ListSearch>` field appears between the page header and the detail layout. `⌘F`/`Ctrl+F` focuses it (browser find suppressed). Typing filters by entity name (case-insensitive substring):

- **Repos** — matched by repo name.
- **People / org chart** — both the OrgChart (visual) and the mobile-fallback `PeopleContent` list are filtered by person name. Nodes/rows not matching the query are excluded.

The Owner block is never filtered. Filter is not applied in compact/popup mode.

## Layout

Two-column: main content on the left, `LinksSidebar` on the right (30% width). Collapses to single column below 768 px.
