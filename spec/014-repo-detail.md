# SPEC-014: Repo detail

**Status:** Established (updated 2026-05-04 — Dependencies section added; updated 2026-05-04 — Used by counter; updated 2026-05-04 — ⌘F in-page filter added)

## Overview

The repo detail page (`#/repo/:id`) shows all contributors to a GitHub repository and any associated external links. The main column is rendered by `<RepoDetailMain repoId={...} />` — also used (in `compact` mode) as the hover popup on every `RepoItem`.

## Header

- `GitBranch` icon, repo name as title. `entity.meta` shown as subtitle if present (short description of the repo's purpose).

## DEPENDENCIES section

If any `uses` claims exist with this repo as `subject`, a "Dependencies" section appears first in the main column (above Projects and Contributors). Each dependency is either:
- A repo entity (`object` matches a known entity id of type `repo`) — rendered as `<RepoItem>`.
- A string label (e.g. `"php8.2"`) — rendered as a `<code>` tag inside an `entity-item` row.

Hidden when no `uses` claims exist. Populated from `repoDepsMap` in `DataContext`.

## PROJECTS section

If any `belongs-to` claims exist with this repo as `subject`, a "Projects" section appears at the top of the main column, above contributors. Lists each project as a `ProjectItem`. Hidden when no projects are linked.

## CONTRIBUTORS section

- Derived from all `contributes-to` claims where this repo is the `object`.
- Contributors sorted alphabetically by name.
- Each row rendered as `<PersonItem>`: avatar (sm) · name link · optional `claim.detail` in uppercase mono · staleness dot.
- If no contributors are recorded, shows "No contributors recorded yet."

## No org chart

Repos have no owner, no team structure, and no org chart. The main column contains only the Dependencies section (if applicable), Projects section (if applicable), and Contributors.

## Layout

Two-column: main content left, `LinksSidebar` right (30%). The `entity` prop is passed to `LinksSidebar`, which auto-generates a GitHub link if the repo name matches `org/repo` format (see SPEC-013). Collapses to single column below 768 px.

## USED BY section

If any other repos declare a `uses` claim pointing to this repo, a "Used by" section appears listing those repos as `<RepoItem>`. The section heading shows a count (`block__heading-count`). Hidden when no usages exist. Populated from `repoUsagesMap` in `DataContext`.

## In-page text filter

A `<ListSearch>` field appears between the page header and the detail layout. `⌘F`/`Ctrl+F` focuses it (browser find suppressed). Typing filters all sections by name (case-insensitive substring):

- **Dependencies** — matched by repo entity name or label string.
- **Projects** — matched by project name.
- **Used by** — matched by repo name.
- **Contributors** — matched by person name.

Filter is not applied in compact/popup mode.

## Not found

If the ID does not match any entity of type `repo`, shows "Repo not found" empty state with a "Back to overview" button.
