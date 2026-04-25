# team-map-viewer

Interactive viewer for company team structure. Renders two CSV files (entities + claims) as interlinked views so engineers can answer "who works on X?" without escalating to a manager. Static SPA, no backend, data lives in the user's browser.

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
  App.tsx                     router + DataProvider wiring
  types.ts                    Entity, Claim, RelationType
  sampleData.ts               inline CSV strings for demo mode
  styles.css                  global CSS (see ADR-008, ADR-012)
  context/DataContext.tsx     global state + localStorage sync
  utils/
    csv.ts                    parseEntities, parseClaims, export, download
    derive.ts                 entityMap, byType, filterClaims, searchEntities, personRoleMap
    stale.ts                  staleDays, staleLevel, staleLabel
  components/
    Layout.tsx                header, nav with counts, inline search (Cmd+L, arrow nav), import modal, footer
    EntityLink.tsx            routes to /person|/project|/squad — uniform teal underline style
    StaleTag.tsx              small colored dot indicator (amber/red by age)
    Avatar.tsx                deterministic color initials avatar (sm/md/lg sizes)
    OrgChart.tsx              project team hierarchy: TL root → PM/PO middle → dev/QA/design branches
    LinksSidebar.tsx          sticky right-column of typed external links per entity
  views/
    TeamOverview.tsx          /  — squad grid, each card has People/Projects tab bar
    RoleList.tsx              /roles  (People view — grouped by role with filter chips)
    ProjectsList.tsx          /projects
    ProjectDetail.tsx         /project/:id
    PersonDetail.tsx          /person/:id  — reports-to + manages back-reference
    SquadDetail.tsx           /squad/:id   — 3-col layout (people · projects · links), hover/focus dims unconnected items
    ImportData.tsx            /import (also renders as modal overlay when onClose prop is provided)
    SearchResults.tsx         /search?q=...
data/
  entities.csv                template rows, no real data
  claims.csv                  template rows, no real data
.github/workflows/deploy.yml  GH Pages deploy on push to main
adr/                          architectural decisions (ADR-001 – ADR-013)
spec/                         behavioral specs (SPEC-001 – SPEC-013)
```

## Key patterns

- **Data flow:** CSV → `parseEntities`/`parseClaims` → `DataContext` → `useData()` hook → views. See [ADR-007](adr/007-react-context-state.md).
- **Routing:** HashRouter for static hosting. All routes under `#/…`. See [ADR-003](adr/003-hash-router.md).
- **Data model:** Entities hold no structure. All relationships (team membership, project work, reporting, ownership, specific role title) are rows in `claims.csv` with per-fact `verified` dates. See [ADR-004](adr/004-two-csv-data-model.md).
- **Role vs meta:** `entity.meta` for a person is the *general category* (e.g. "Developer") — used for grouping in RoleList, SquadDetail role groups, and OrgChart. A `role` claim (`subject: personId, relation: role, object: "Senior Frontend Developer"`) is the *specific display title* — shown in PersonDetail subtitle and inline in squad card person lists. Use `personRoleMap(claims)` from `utils/derive.ts` to build a `Map<personId, title>`.
- **0-member projects hidden:** Projects with no `works-on` claims are filtered out in all views (ProjectsList, TeamOverview SquadCard projects tab, SquadDetail projects column). Compute via `teamSize` map from `works-on` claims.
- **Staleness:** `StaleTag` reads a claim's `verified` date and renders a small colored dot (teal ≤30d, amber 30-60d, orange 60-90d, red >90d). Pass as the first child of a `.claim-item` list item. See [SPEC-002](spec/002-staleness.md).
- **Entity cross-linking:** Always use `<EntityLink entity={...} />` — never hand-roll `<Link to="/person/...">`. All entity links render as teal underlines regardless of type.
- **Filtering claims:** Use `filterClaims(claims, { subject?, relation?, object? })` from `utils/derive.ts`. Don't re-implement filter logic inline.
- **Rules of Hooks:** All `useMemo`/`useState`/`useCallback` calls must appear before any conditional early return. Detail views (PersonDetail, ProjectDetail, SquadDetail) compute derived data with `useMemo` before the "not found" guard.
- **Org chart hierarchy:** `OrgChart` renders three levels — TL (root, md nodes) → PM/PO (intermediate row, md nodes) → dev/QA/design (branch columns, sm nodes). Missing levels collapse gracefully. See [SPEC-008](spec/008-project-detail.md).
- **Squad detail layout:** Uses `.squad-detail-layout` (3-col: `1fr 1fr 30%`) not `.detail-layout`. People column and projects column carry hover/focus state that dims items the hovered entity has no `works-on` connection to. See [SPEC-007](spec/007-squad-detail.md).
- **Behavioral specs:** `spec/` documents established UI behaviors. Update the relevant spec whenever behavior changes. See [ADR-013](adr/013-behavioral-specs.md).
- **Demo mode:** If `localStorage['team-map-v1']` is missing, sample data loads into memory only (`isDemo: true`). Any user import replaces it permanently. See [ADR-011](adr/011-sample-data-demo-mode.md).
- **Import modal:** `<ImportData onClose={fn} />` renders as a modal overlay; `<ImportData />` (no prop) renders as a full page. `Layout` manages `showImport` state and renders the modal.
- **Design system:** Warm cream background, Fraunces/Geist/JetBrains Mono fonts, teal accent. See [ADR-012](adr/012-editorial-design-system.md).
- **Deploy:** `vite.config.ts` has `base: '/team-map-viewer/'` — must match the GitHub repo name. See [ADR-002](adr/002-vite-build-tool.md) and [ADR-009](adr/009-gh-pages-deploy.md).

## Conventions

- **TS strict mode** (`strict: true`, `jsx: "react-jsx"`, `moduleResolution: "bundler"`).
- **Function components only**, hooks for state.
- **2-space indent**, single quotes, semicolons, trailing commas (Vite/React default, not enforced by a linter).
- **File naming:** PascalCase for components/views (`TeamOverview.tsx`), camelCase for utils (`derive.ts`).
- **Class names:** BEM-ish — `.squad-card__header`, `.claim-item__detail`. Utility classes: `.font-display`, `.font-mono`.
- **No data in the repo.** `data/*.csv` contains fictional template rows only. Real org data goes into a separate private Git repo and is imported through the UI.
- **No real company names, emails, or identifiers** in commits, sample data, or comments.
