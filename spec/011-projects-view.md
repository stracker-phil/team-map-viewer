# SPEC-011: Projects view

**Status:** Established (updated 2026-04-26 — table layout replaces card grid)

## Overview

The projects view (`#/projects`) shows all active projects as a sortable table with optional owner filtering.

## Owner filter chips

A row of filter chips appears above the table whenever any project has an `owned-by` claim.

- **ALL · {N}** — always first; resets the filter; shows total active project count.
- **{Squad name} · {N}** — one chip per squad that owns ≥1 project; sorted by project count descending.
- **OTHER · {N}** — shown only when ≥1 project has no `owned-by` claim; filters to unowned projects.

Clicking an active chip deselects it (returns to ALL). Clicking a different chip switches the filter directly.

## Table

- Only projects with ≥1 `works-on` member are shown. Zero-member projects are hidden everywhere.
- Project entities are deduplicated by id before display to guard against duplicate rows in source CSV.
- Columns: **Name** (dynamic width) · **Team size** (100 px, fixed) · **Owner** (100 px, fixed).
- `table-layout: fixed` — name column takes all remaining width.
- Each row is clickable and navigates to `#/project/:id`.

## Empty state

If no active project entities exist, shows "No projects yet" with an "Import data" button.
