# SPEC-004: Navigation and routing

**Status:** Established

## Overview

The app is a hash-routed SPA. All URLs are `#/…` paths so the app can be served as a static file from any sub-path.

## Routes

| Path                | View            |
|---------------------|-----------------|
| `#/`                | Squad overview  |
| `#/roles`           | People (roster) |
| `#/projects`        | Projects list   |
| `#/squad/:id`       | Squad detail    |
| `#/project/:id`     | Project detail  |
| `#/person/:id`      | Person detail   |
| `#/search?q=…`      | Search results  |
| `#/import`          | Import page     |

## Global navigation bar

The persistent nav bar shows three links (Squads, People, Projects), each with a zero-padded entity count (e.g. `07`). The active link is highlighted in teal. The search field sits on the right side of the bar.

## Entity links

All cross-references between entities render as `<EntityLink>`. Clicking navigates to the corresponding detail page. Link color is always teal, regardless of entity type.

## Back navigation

Each detail page and the search results page shows a "← BACK TO OVERVIEW" button. It calls `navigate(-1)` — going back in browser history — rather than navigating to a fixed route. If there is no history (direct page load), behavior is browser-default.

## Not found

If a detail route receives an ID that does not match any entity of the expected type, an "Entity not found" empty state is shown with a "Back to overview" button linking to `#/`.
