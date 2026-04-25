# SPEC-011: Projects view

**Status:** Established

## Overview

The Projects view (`#/projects`) shows all projects as a 2-column card grid.

## Grid

- Only projects with ≥1 `works-on` member are shown. Projects with 0 members are hidden (treated as stale/inactive).
- Remaining projects rendered as cards, in the order they appear in `entities`.
- 2 columns on desktop, 1 column below 768 px.

## Project card

Each card is a clickable button that navigates to `#/project/:id`. It shows:

- **Eyebrow**: `meta` (client name), only rendered if `meta` is non-empty. No fallback label.
- **Name**: project name in Fraunces serif.
- **Footer bar**: "TEAM · {count}" showing the number of `works-on` claims for the project, plus "OWNER · {squad name}" if an `owned-by` claim exists. Both values are uppercase monospace.

## Empty state

If no project entities exist, shows "No projects yet" with an "Import data" button.
