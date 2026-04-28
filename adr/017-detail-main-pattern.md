# ADR-017: *DetailMain component pattern

**Status:** Accepted (amended 2026-04-27 — `pdm-*` classes replaced with shared `block`/`stack`/`cols-2` system; compact mode returns body-only; amended 2026-04-28 — popup header merged into EntityPopup; `PopupHeader` component deleted; `*DetailMain` compact mode no longer references header)

## Context

After `PersonDetailMain` was extracted (ADR-016) to serve both the full PersonDetail page and as compact popup content inside `PersonItem`, the same need arose for `ProjectItem` and `RepoItem`: hovering a project or repo list item should show a quick-glance popup without navigating away.

Duplicating the detail logic inside a popup-specific component would split the source of truth and make both the popup and the page harder to maintain.

## Decision

Each entity type that has a detail view and appears in lists gets a `*DetailMain` component:

- `PersonDetailMain` — person
- `ProjectDetailMain` — project
- `RepoDetailMain` — repo
- `SquadDetailMain` — squad (compact + full mode)

Each component:
- Accepts `entityId: string` and `compact?: boolean`, calls `useData()` internally.
- In **full mode** (default): renders `<div className="detail-main">` — the main column of the corresponding detail page. All `useMemo` derivations run here; the view shell (header, back-link, `LinksSidebar`) stays in the view file.
- In **compact mode** (`compact`): returns only the body — a `.popup__body` (optionally `--split`) with `.popup__col` children. The sticky header is **not** included here; `EntityPopup` builds it internally from its own `entity`/`meta` props.

### Shared block components (inline in each `*DetailMain` file)

Each `*DetailMain` file defines inner block components (e.g. `SquadsBlock`, `ProjectsBlock`, `PeopleBlock`) that render the same JSX structure in both modes. The visual difference between compact and full comes exclusively from CSS cascade.

### Block class system

Shared block components use the unified `.block` class (defined in `layout.css`/`styles.css`):

- **`.block`** — default = card surface (`background: var(--surface)`, padding, border-radius). Used in full-page `.detail-main` context.
- **`.popup .block`** — inside a popup: `background: none; padding: 0; border-radius: 0`. Strips card treatment automatically.
- **`.block--bare`** — explicitly strips card treatment regardless of context (used for SquadCard stacks that carry their own card style).
- **`.block__heading`** — section label, styled consistently in both modes.
- **`.block__empty`** — empty-state text inside a block.

Layout utilities:
- **`.stack`** / **`.stack--tight`** — vertical flex stack.
- **`.cols-2`** — two-column grid (`1fr 1fr`). Used in `PersonDetailMain` full mode.
- **`.popup__body`** / **`.popup__body--split`** — popup body container (optionally split into left/right columns via `.popup__col`).

### 2-column layout in PersonDetailMain (full mode)

The PersonDetail main column uses `.cols-2` when both sides have content: left column holds squads, repos, and people sections; right column holds projects. This matches the compact popup split so both modes share the same visual hierarchy. Falls back to single `.stack` column when only one side has content.

### PeopleBlock: stacked layout in both modes

The People section renders role groups as a stacked list (role sublabel → entity-list → next role...) in both compact and full mode.

## Consequences

- View files (`ProjectDetail`, `RepoDetail`, `PersonDetail`) are thin shells: header markup + layout wrapper + `<*DetailMain projectId={...} />` + `<LinksSidebar>`.
- Popup content and page content share one source of truth per entity type.
- Adding a new section to the detail view automatically makes it visible in the popup too.
- `ProjectItem`, `RepoItem`, and `SquadCard` now show hover/focus popups (same 1000 ms delay as `PersonItem`).
- Nested popups are **enabled** — entity items inside compact popup content do not suppress their own popups.
- Popup header is never duplicated — `EntityPopup` builds it from `entity`/`meta`; each `*DetailMain` compact mode only concerns itself with body content.
