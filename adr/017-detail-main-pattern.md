# ADR-017: *DetailMain component pattern

**Status:** Accepted

## Context

After `PersonDetailMain` was extracted (ADR-016) to serve both the full PersonDetail page and as compact popup content inside `PersonItem`, the same need arose for `ProjectItem` and `RepoItem`: hovering a project or repo list item should show a quick-glance popup without navigating away.

Duplicating the detail logic inside a popup-specific component would split the source of truth and make both the popup and the page harder to maintain.

## Decision

Each entity type that has a detail view and appears in lists gets a `*DetailMain` component:

- `PersonDetailMain` — person
- `ProjectDetailMain` — project
- `RepoDetailMain` — repo
- `SquadDetailMain` — squad (compact-only for now; full mode remains in `SquadDetail.tsx`)

Each component:
- Accepts `entityId: string` and `compact?: boolean`, calls `useData()` internally.
- In **full mode** (default): renders `<div className="detail-main">` — the main column of the corresponding detail page. All `useMemo` derivations run here; the view shell (header, back-link, `LinksSidebar`) stays in the view file.
- In **compact mode** (`compact`): renders a `.*-popup` wrapper with a sticky title bar and a body column. Used as the `popup` prop of `EntityPopup` inside `*Item` components. Nested entity-item popups are disabled (`disablePopup` / `disablePopups`).

### Shared block components (inline in each `*DetailMain` file)

Each `*DetailMain` file defines inner block components (e.g. `SquadsBlock`, `ProjectsBlock`, `PeopleBlock`) that render the same JSX structure in both modes. The visual difference between compact and full comes exclusively from CSS cascade — the `.*-popup` vs `.detail-main` ancestor class selects which style applies.

### `pdm-*` CSS class system

Shared block components use `pdm-section`, `pdm-section__heading`, `pdm-squads`, `pdm-people`, `pdm-people__key` class names:

- **Base styles** (no qualifier) — compact / popup appearance: no card background, compact padding, flex-column people list, smaller labels.
- **`.detail-main .pdm-*` overrides** — full-page appearance: `var(--surface)` card background, larger padding and border-radius, slightly larger label text.

The `pdm-section--squads` modifier strips the card background and hides the heading in `.detail-main` context (SquadCards carry their own card styling; a wrapper card would double-nest them).

### 2-column layout in PersonDetailMain (full mode)

The PersonDetail main column uses a 2-col grid (`pdm-cols pdm-cols--split`) mirroring the compact popup split: left column holds squads, repos, and people sections; right column holds projects. This matches the compact layout order so both modes share the same visual hierarchy.

### PeopleBlock: stacked layout in both modes

The People section renders role groups as a stacked list (role sublabel → entity-list → next role...) in both compact and full mode. The earlier grid layout (`dl-table` two-column key/value) was removed.

## Consequences

- View files (`ProjectDetail`, `RepoDetail`, `PersonDetail`) are thin shells: header markup + layout wrapper + `<*DetailMain projectId={...} />` + `<LinksSidebar>`.
- Popup content and page content share one source of truth per entity type.
- Adding a new section to the detail view automatically makes it visible in the popup too.
- `ProjectItem`, `RepoItem`, and `SquadCard` now show hover/focus popups (same 1000 ms delay as `PersonItem`).
- Nested popups are **enabled** — entity items inside compact popup content do not suppress their own popups. The click stopPropagation in `EntityPopup` (see ADR-016) ensures clicks in inner popups do not leak to outer trigger handlers.
