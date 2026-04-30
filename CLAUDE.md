# team-map-viewer

Interactive viewer for company team structure. Renders a single `team.json` file (entities + claims) as interlinked views so engineers can answer "who works on X?" without escalating to a manager. Static SPA, no backend, data lives in the user's browser.

See [PLAN.md](PLAN.md) for the full product spec.

## Commands

```bash
npm install          # install dependencies
npm run dev          # dev server → http://localhost:5173/team-map-viewer/
npm run build        # type-check (tsc) + production build → dist/
npm run preview      # serve the built dist/ locally
```

No test runner, no linter — see [ADR-010](adr/010-no-tests-no-lint.md). `tsc` in the build script is the quality gate.

## Project structure

```
src/
  main.tsx                    entry point
  App.tsx                     router + StarProvider + DataProvider wiring
  types.ts                    Entity, Claim, RelationType
  sampleData.ts               inline SAMPLE_TEAM_JSON string for demo mode
  layout.css                  structural layout primitives (page/topbar/page-header/detail-layout/block/popup/overlay/grids); no colors or fonts
  styles.css                  global theme CSS — colors, typography, surface treatments (see ADR-008, ADR-012)
  context/DataContext.tsx     global state + derived maps + localStorage sync
  context/StarContext.tsx     star/bookmark state — Set<string> of starred entity IDs, localStorage key team-map-stars-v1
  utils/
    csv.ts                    parseTeamJson, exportTeamJson
    derive.ts                 byType, filterClaims, searchEntities (entityMap/personRoleMap now in DataContext)
    stale.ts                  staleDays, staleLevel, staleLabel
  components/
    Layout.tsx                fixed 48px topbar (brand · nav · import · search icon), CMD+K search overlay, import modal
    EntityLink.tsx            routes to /person|/project|/squad|/repo — uniform teal underline style
    StaleTag.tsx              small colored dot indicator (amber/red by age)
    Avatar.tsx                deterministic color initials avatar (sm/md/lg sizes)
    EntityPopup.tsx           reusable hover/focus popup wrapper: `as` + `entity` + `meta` + `popup` props, builds header internally, 1000ms open delay, portal/absolute positioning (no scroll listeners), lazy mount
    StarButton.tsx            toggle star on detail pages — amber filled icon when starred; calls useStar()
    StarIndicator.tsx         read-only amber ★ shown in list items when entity is starred; calls useStar()
    OrgChart.tsx              project team hierarchy: TL root → PM/PO middle → dev/QA/design branches; OrgNode uses EntityPopup
    LinksSidebar.tsx          sticky right-column of typed external links per entity; auto-generates GitHub link for org/repo-named repos
    SquadCard.tsx             squad card (name + dynamic stats), used in overview + PersonDetail; wraps EntityPopup; calls useData() internally
    PersonDetailMain.tsx      person detail main column; full mode: 2-col grid (left: squads/repos/people, right: projects); compact: popup
    ProjectDetailMain.tsx     project detail main column; full mode: owner (SquadCard) + repos + org chart + sources; compact: owner + repos + people popup
    RepoDetailMain.tsx        repo detail main column; full mode: projects + contributors list; compact: projects + contributors popup
    SquadDetailMain.tsx       squad detail compact popup: members by role group + owned projects; compact-only (full page stays in SquadDetail.tsx)
    PersonItem.tsx            canonical person list item: StarIndicator + Avatar + EntityLink + optional detail + optional StaleTag; wraps EntityPopup
    ProjectItem.tsx           canonical project list item: StarIndicator + EntityLink + optional detail + StaleTag; wraps EntityPopup
    RepoItem.tsx              canonical repo list item: StarIndicator + EntityLink + optional detail + StaleTag; wraps EntityPopup
  views/
    TeamOverview.tsx          /  — squad grid, each card is a single click-to-navigate card (no tabs)
    RoleList.tsx              /roles  (People view — grouped by role with filter chips)
    ProjectsList.tsx          /projects — owner filter chips, table (Name · Team size · Owner)
    ReposList.tsx             /repos — table of all repos (Name · Contributors), no filter
    ProjectDetail.tsx         /project/:id
    PersonDetail.tsx          /person/:id  — header shell; delegates main column to PersonDetailMain
    SquadDetail.tsx           /squad/:id   — 3-col layout (people · projects+repos · links)
    RepoDetail.tsx            /repo/:id    — contributor list + LinksSidebar, no org chart
    ImportData.tsx            /import (also renders as modal overlay when onClose prop is provided)
    SearchResults.tsx         /search?q=...
data/
  team.json                   template data, no real data
.github/workflows/deploy.yml  GH Pages deploy on push to main
adr/                          architectural decisions (ADR-001 – ADR-018)
spec/                         behavioral specs (SPEC-001 – SPEC-015)
```

## Key patterns

- **Data flow:** JSON → `parseTeamJson` → `DataContext` → `useData()` hook → views. See [ADR-007](adr/007-react-context-state.md) and [ADR-019](adr/019-json-data-format.md).
- **Derived context:** `DataContext` computes derived maps once (memoized): `entityMap`, `people`, `squads`, `projects`, `repos`, `teamSize`, `squadOf`, `personRoleMap`, `contributorCount`. Views destructure from `useData()` — no per-view re-derivation. `filterClaims` from `utils/derive.ts` is still used for per-entity queries in detail views. See [ADR-007](adr/007-react-context-state.md).
- **Routing:** HashRouter for static hosting. All routes under `#/…`. See [ADR-003](adr/003-hash-router.md).
- **Data model:** Entities hold no structure. All relationships (team membership, project work, reporting, ownership, specific role title, repo contributions, repo-to-project membership, external links) are claim objects in `team.json` with per-fact `verified` dates. Entity types: `person`, `project`, `squad`, `repo`. See [ADR-004](adr/004-two-csv-data-model.md).
- **Link claims:** External links use `relation: link`. `subject` = entity id, `object` = full URL, `detail` = display label, `source` = link type (jira/slack/confluence/github/website/wporg/personio/…). `LinksSidebar` reads claims filtered by `relation === 'link'` and groups by `source`.
- **Repo naming:** Repo entity names use `org/repo` format (e.g. `acme/api-server`). `LinksSidebar` auto-generates a GitHub link for repos whose name matches this pattern — no explicit `link` claim needed. See [ADR-004](adr/004-two-csv-data-model.md).
- **Role vs meta:** `entity.meta` for a person is the *general category* (e.g. "Developer") — used for grouping in RoleList, SquadDetail role groups, and OrgChart. A `role` claim (`subject: personId, relation: role, object: "Senior Frontend Developer"`) is the *specific display title* — shown in PersonDetail subtitle and inline in squad card person lists. `personRoleMap` is available directly from `useData()`.
- **works-on vs contributes-to:** `works-on` targets `project` entities; `contributes-to` targets `repo` entities. On PersonDetail these appear in separate cards — "Projects" and "Other Repos". `works-on` claims pointing to `repo` entities are silently rerouted to Other Repos. `teamSize` (from context) only counts `works-on` claims where the target is a `project` entity. See [SPEC-009](spec/009-person-detail.md).
- **belongs-to:** `belongs-to` claims connect a repo (`subject`) to a project (`object`). ProjectDetail shows a "Repos" section (after owner) listing all repos that belong to the project. RepoDetail shows a "Projects" section (above contributors) listing all projects the repo belongs to. Both sections hidden when no `belongs-to` claims exist. See [ADR-004](adr/004-two-csv-data-model.md).
- **repo/ prefix:** `parseTeamJson` silently strips a `repo/` prefix from entity IDs and from `subject`/`object` in claims at import time. The prefix never enters the app's data context or URLs. See [SPEC-012](spec/012-import-export.md).
- **0-member projects hidden:** Projects with no `works-on` members are filtered out in ProjectsList, SquadCard stats, and SquadDetail projects column. Use `teamSize` from `useData()`.
- **Entity item components:** All person/project/repo list items use `<PersonItem>`, `<ProjectItem>`, `<RepoItem>` rendered in `<ul className="entity-list">`. Never hand-roll list items for entity content. `PersonItem.claim` is optional — omit when no per-row claim is in scope. All three wrap `EntityPopup` — nested popups are supported, do not pass `disablePopup`. See [ADR-015](adr/015-entity-item-components.md).
- **Staleness:** `StaleTag` reads a claim's `verified` date and renders a small colored dot (teal ≤30d, amber 30-60d, orange 60-90d, red >90d). Passed to entity item components via the `claim` prop. See [SPEC-002](spec/002-staleness.md).
- **Entity cross-linking:** Always use `<EntityLink entity={...} />` — never hand-roll `<Link to="/person/...">`. All entity links render as teal underlines regardless of type.
- **Filtering claims:** Use `filterClaims(claims, { subject?, relation?, object? })` from `utils/derive.ts`. Don't re-implement filter logic inline.
- **Rules of Hooks:** All `useMemo`/`useState`/`useCallback` calls must appear before any conditional early return. `*DetailMain` components (PersonDetailMain, ProjectDetailMain, RepoDetailMain) compute derived data with `useMemo` before any guard or conditional render.
- **Org chart hierarchy:** `OrgChart` renders three levels — TL (root, md nodes) → PM/PO (intermediate row, md nodes) → dev/QA/design (branch columns, sm nodes). Missing levels collapse gracefully. See [SPEC-008](spec/008-project-detail.md).
- **Squad detail layout:** Uses `.detail-layout.detail-layout--3col` (3-col: `1fr 1fr 30%`). Column 2 stacks Projects then Repos via `.stack` (repos hidden when none). Repos shown if directly `owned-by` squad OR `belongs-to` any squad-owned project. No cross-highlight dim interaction — removed in favour of EntityPopup drill-down. See [SPEC-007](spec/007-squad-detail.md).
- **EntityPopup:** `<EntityPopup as="..." entity={...} meta={...} popup={<Content />}>` wraps any trigger element. Pass `entity` (required) and `meta` (optional string); `EntityPopup` builds the sticky `.popup__header` Link internally — no separate `PopupHeader` component. 1000ms open delay, 50ms close delay (bridges pointer gap). Popup renders as a `position: absolute` portal at `document.body`. Vertical position anchors to the mouse cursor Y at open time (tracked via `onMouseMove` during delay so it's current); horizontal position anchors to the trigger's `rect.left`. For keyboard focus, falls back to trigger rect. Above/below decided once on open. Popup unmounts on close. Use `disabled` to suppress. Optional `onClick` prop forwarded to trigger element (used by SquadCard button). The popup div calls `e.stopPropagation()` on all clicks — React portals bubble through the React tree, not the DOM tree, so without this, clicks in nested popups leak to ancestor trigger `onClick` handlers. See [ADR-016](adr/016-entity-popup.md).
- **`*DetailMain` pattern:** `PersonDetailMain`, `ProjectDetailMain`, `RepoDetailMain`, `SquadDetailMain` each serve double duty: full mode renders `<div className="detail-main">` for the detail page; compact mode returns only the body — a `.popup__body` (optionally `--split`) with `.popup__col` children. The popup header is built inside `EntityPopup` from its `entity`/`meta` props — `*DetailMain` compact mode returns body content only, never header markup. Sections inside use the shared `.block` class — default = card surface (full mode); `.popup .block` strips the surface (compact). `.block--bare` strips card style explicitly (used for the SquadCard stack which has its own card). People groups are always stacked (role sublabel → list), not a grid. See [ADR-017](adr/017-detail-main-pattern.md).
- **PersonDetailMain full mode layout:** 2-col split (`.cols-2`) when both sides have content: left col = squads + other repos + people; right col = projects. Single column = `.stack`. Mirrors the compact popup column order. See [ADR-017](adr/017-detail-main-pattern.md).
- **Star/bookmark system:** `StarContext` (`useStar()`) holds a `Set<string>` of starred entity IDs, persisted to `localStorage['team-map-stars-v1']`. `StarButton` (detail pages only) toggles star. `StarIndicator` (read-only amber ★) renders in `PersonItem`, `ProjectItem`, `RepoItem`, `SquadCard` before the entity name. All list views and detail-page sub-lists sort starred entities first — include `starred` (the Set) in each relevant `useMemo` dep array so re-sorting is reactive. See [ADR-018](adr/018-star-bookmarks.md).
- **Behavioral specs:** `spec/` documents established UI behaviors. Update the relevant spec whenever behavior changes. See [ADR-013](adr/013-behavioral-specs.md).
- **Demo mode:** If `localStorage['team-map-v1']` is missing, sample data loads into memory only (`isDemo: true`). Any user import replaces it permanently. See [ADR-011](adr/011-sample-data-demo-mode.md).
- **Import modal:** `<ImportData onClose={fn} />` renders as a modal overlay; `<ImportData />` (no prop) renders as a full page. `Layout` manages `showImport` state and renders the modal. When real data is loaded (`isDemo: false`), the textarea initializes with the current JSON so users can review or copy what's active. Textarea is empty in demo mode.
- **No export:** The app is a read-only viewer. There is no export button. `exportTeamJson` exists solely to populate the import textarea with current data for review or copy. See [ADR-014](adr/014-static-read-only-viewer.md).
- **Design system:** `--bg: #fafafa`, `--surface: #E1E3E2` (cards), `--sidebar-bg: #FFDBCC` (links sidebar), teal accent `#1F4842`. Fraunces/Geist/JetBrains Mono fonts. Cards use background color for depth — no decorative borders. Fixed 48px topbar; CMD+K (`⌘K`/`Ctrl+K`) opens search overlay. See [ADR-012](adr/012-editorial-design-system.md).
- **Type badges:** Entity type has distinct color chip (`.type-badge.type-badge--{type}`). CSS vars `--type-{person,squad,project,repo}-{bg,text}` defined on `:root` for easy retheming. Currently used in CMD+K results.
- **Detail page sections:** Use the unified `.block` class (card background `var(--surface)`, `.block__heading`, `.block__empty`). `.popup .block` strips the surface in compact/popup mode. `.block--bare` strips card style explicitly. Sidebar uses `background: var(--sidebar-bg)` via `.links-sidebar`; sticky offset comes from `.detail-aside` in `layout.css`.
- **Squad cards:** `SquadCard` wraps `EntityPopup as="button"` — click navigates to squad detail, hover (1000ms) shows `SquadDetailMain compact` popup (members by role + owned projects). Stats line is dynamic: zero-count items are omitted. Reused on PersonDetail and TeamOverview. Calls `useData()` internally — no props needed at call sites.
- **Entity tables:** `ProjectsList` and `ReposList` use `<table className="entity-table">` with `table-layout: fixed`. Name column is dynamic-width; all other columns are 100 px fixed. Name column has `padding-left: 1em`. Rows are clickable.
- **Deploy:** `vite.config.ts` has `base: '/team-map-viewer/'` — must match the GitHub repo name. See [ADR-002](adr/002-vite-build-tool.md) and [ADR-009](adr/009-gh-pages-deploy.md).

## Conventions

- **TS strict mode** (`strict: true`, `jsx: "react-jsx"`, `moduleResolution: "bundler"`).
- **Function components only**, hooks for state.
- **2-space indent**, single quotes, semicolons, trailing commas (Vite/React default, not enforced by a linter).
- **File naming:** PascalCase for components/views (`TeamOverview.tsx`), camelCase for utils (`derive.ts`).
- **Class names:** BEM-ish — `.squad-card__header`, `.claim-item__detail`. Utility classes: `.font-display`, `.font-mono`.
- **No data in the repo.** `data/*.csv` contains fictional template rows only. Real org data goes into a separate private Git repo and is imported through the UI.
- **No real company names, emails, or identifiers** in commits, sample data, or comments.
