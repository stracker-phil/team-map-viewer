# SPEC-014: Repo detail

**Status:** Established (updated 2026-04-27 — RepoDetailMain extraction, RepoItem hover popup; Projects section added)

## Overview

The repo detail page (`#/repo/:id`) shows all contributors to a GitHub repository and any associated external links. The main column is rendered by `<RepoDetailMain repoId={...} />` — also used (in `compact` mode) as the hover popup on every `RepoItem`.

## Header

- `GitBranch` icon, repo name as title. `entity.meta` shown as subtitle if present (short description of the repo's purpose).

## PROJECTS section

If any `belongs-to` claims exist with this repo as `subject`, a "Projects" section appears at the top of the main column, above contributors. Lists each project as a `ProjectItem`. Hidden when no projects are linked.

## CONTRIBUTORS section

- Derived from all `contributes-to` claims where this repo is the `object`.
- Contributors sorted alphabetically by name.
- Each row rendered as `<PersonItem>`: avatar (sm) · name link · optional `claim.detail` in uppercase mono · staleness dot.
- If no contributors are recorded, shows "No contributors recorded yet."

## No org chart

Repos have no owner, no team structure, and no org chart. The main column contains only the Projects section (if applicable) and Contributors.

## Layout

Two-column: main content left, `LinksSidebar` right (30%). The `entity` prop is passed to `LinksSidebar`, which auto-generates a GitHub link if the repo name matches `org/repo` format (see SPEC-013). Collapses to single column below 768 px.

## Not found

If the ID does not match any entity of type `repo`, shows "Repo not found" empty state with a "Back to overview" button.
