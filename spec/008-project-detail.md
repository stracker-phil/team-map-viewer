# SPEC-008: Project detail

**Status:** Established

## Overview

The project detail page (`#/project/:id`) shows a project's owning squad, its team structure as an org chart, and source provenance.

## Header

- Eyebrow: "PROJECT".
- Title: project name.
- Sub-title: "Client: {meta}" if `meta` is non-empty.

## Meta section

Shows the owning squad as a single `EntityLink` with a staleness dot. If no `owned-by` claim exists for the project, displays "No owner recorded yet."

## Org chart (desktop)

On screens 640 px and wider, the team is shown as a visual org chart. The hierarchy has up to three levels:

1. **Team Lead (TL)** — top row. Rendered as medium-size nodes.
2. **Project Manager / Product Owner (PM, PO)** — middle row, below TL. Rendered as medium-size nodes.
3. **Engineering / QA / Design (dev, QA, design)** — branch columns at the bottom, each in its own labeled column with small-size nodes.

Connector lines (vertical stems and a horizontal top-border) link the levels visually. If a level is absent, the chart collapses gracefully — e.g. a project with only TL and dev produces a two-level chart with no PM row.

Within each level/column, people are sorted alphabetically by name.

## Mobile fallback (< 640 px)

The org chart is hidden. A flat `dl-table` grouped by role replaces it. Role order: TL → PM → PO → dev → QA → design → (other). People within each role are comma-separated inline.

## Sources

If any claim for the project has a non-empty `source`, a de-emphasized "SOURCES" block appears below the people section listing each unique source string and how many claims cite it.

## Layout

Two-column: main content on the left, `LinksSidebar` on the right (30% width). Collapses to single column below 768 px.
