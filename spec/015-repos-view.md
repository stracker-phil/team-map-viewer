# SPEC-015: Repos view

**Status:** Established (2026-04-26; updated 2026-04-27 — starred repos sort to top)

## Overview

The repos view (`#/repos`) lists all GitHub repositories recorded in the data as a static table.

## Table

- All `repo` entities are shown (deduplicated by id). No filter chips. Starred repos appear first (amber `StarIndicator` prefix); then in `entities.csv` order.
- Columns: **Name** (dynamic width) · **Contributors** (100 px, fixed).
- Contributor count is derived from `contributes-to` claims where the repo is the object.
- `table-layout: fixed` — name column takes all remaining width.
- Each row is clickable and navigates to `#/repo/:id`.

## Empty state

If no repo entities exist, shows "No repos yet" with an "Import data" button.
