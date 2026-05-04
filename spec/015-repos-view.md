# SPEC-015: Repos view

**Status:** Established (2026-04-26; updated 2026-04-27 — starred repos sort to top; updated 2026-05-04 — PHP column, filter chips, text filter; updated 2026-05-04 — ALL chip shows total repo count)

## Overview

The repos view (`#/repos`) lists all GitHub repositories recorded in the data as a static table.

## Text filter

A `<ListSearch>` input appears above the filter chips. Filters by repo name or id (case-insensitive substring). `⌘F` / `Ctrl+F` focuses and selects the input (browser find is suppressed).

## PHP filter chips

A row of `<FilterChips>` appears below the text filter whenever ≥2 distinct PHP versions exist across repos OR any repos have no PHP version alongside those that do:

- **ALL · {N}** — resets filter; count = total number of repos (all, not just those with PHP).
- **PHP {version} · {N}** — one chip per distinct version string (e.g. `8.1`, `8.3`), sorted ascending.
- **NO PHP · {N}** — shown when ≥1 repo has no PHP `uses` claim; filters to those repos.

Clicking an active chip deselects it (returns to ALL). PHP version is extracted from `uses` claims where the object matches `/^php\d/i` (case-insensitive). The `php` prefix is stripped for display.

## Table

- All `repo` entities are shown (deduplicated by id). Starred repos appear first (amber `StarIndicator` prefix); then alphabetical within the filter.
- Columns: **Name** (dynamic width) · **PHP** (100 px, fixed) · **Contributors** (100 px, fixed).
- PHP column shows the extracted version string (e.g. `8.3`), empty when no PHP `uses` claim exists.
- Contributor count is derived from `contributes-to` claims where the repo is the object.
- `table-layout: fixed` — name column takes all remaining width.
- Each row is clickable and navigates to `#/repo/:id`.

## Empty state

If no repo entities exist, shows "No repos yet" with an "Import data" button.
