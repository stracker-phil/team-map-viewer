# SPEC-004: Navigation and routing

**Status:** Established (updated April 2026 — fixed topbar, CMD+K search; updated 2026-05-04 — ⌘1–⌘4 nav shortcuts)

## Overview

The app is a hash-routed SPA. All URLs are `#/…` paths so the app can be served as a static file from any sub-path.

## Routes

| Path                | View            |
|---------------------|-----------------|
| `#/`                | Squad overview  |
| `#/roles`           | People (roster) |
| `#/projects`        | Projects list   |
| `#/repos`           | Repos list      |
| `#/squad/:id`       | Squad detail    |
| `#/project/:id`     | Project detail  |
| `#/person/:id`      | Person detail   |
| `#/repo/:id`        | Repo detail     |
| `#/search?q=…`      | Search results  |
| `#/import`          | Import page     |

## Fixed top bar

A 48 px fixed navigation bar (`position: fixed; top: 0`) spans the full viewport width. Page content is offset by `padding-top: 48px`.

The bar contains (left to right):

1. **Brand wordmark** — "Team Map." in Fraunces, links to `#/`.
2. **Nav links** — Squads · People · Projects · Repos, each with a `<KbdChip>` (⌘1–⌘4) and a zero-padded entity count. Active link highlighted in teal. Pressing `⌘1`/`Ctrl+1` through `⌘4`/`Ctrl+4` navigates to the corresponding section.
3. **Import button** — opens the import modal overlay.
4. **Search icon button** — opens the CMD+K search overlay.

No footer is shown.

## CMD+K search overlay

Triggered by clicking the search icon in the topbar, or pressing `⌘K` / `Ctrl+K` anywhere in the app.

Behavior:
- Renders a blurred full-screen backdrop with a centred input box.
- Input is auto-focused on open.
- Results update as the user types, showing up to 8 matches.
- Each result shows a colored type badge (`.type-badge--{type}`) and the entity name and meta.
- Arrow keys move selection; `Enter` navigates to the selected entity, or to `#/search?q=…` if no result is selected.
- `Escape` or clicking the backdrop closes the overlay.

## Entity links

All cross-references between entities render as `<EntityLink>`. Clicking navigates to the corresponding detail page. Link color is always teal, regardless of entity type.

## Back navigation

Each detail page shows a "← BACK" button. It calls `navigate(-1)` — going back in browser history. If there is no history (direct page load), behavior is browser-default.

## Not found

If a detail route receives an ID that does not match any entity of the expected type, an "Entity not found" empty state is shown with a "Back to overview" button linking to `#/`.
