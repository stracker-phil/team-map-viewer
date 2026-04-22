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
  styles.css                  global CSS (see ADR-008)
  context/DataContext.tsx     global state + localStorage sync
  utils/
    csv.ts                    parseEntities, parseClaims, export, download
    derive.ts                 entityMap, byType, filterClaims, searchEntities
    stale.ts                  staleDays, staleLevel, staleLabel
  components/
    Layout.tsx                header, nav, search, demo banner
    EntityLink.tsx            routes to /person|/project|/squad
    StaleTag.tsx              colored age badge (30/60/90d thresholds)
  views/
    TeamOverview.tsx          /
    RoleList.tsx              /roles
    ProjectDetail.tsx         /project/:id
    PersonDetail.tsx          /person/:id
    SquadDetail.tsx           /squad/:id
    ImportData.tsx            /import
    SearchResults.tsx         /search?q=...
data/
  entities.csv                template rows, no real data
  claims.csv                  template rows, no real data
.github/workflows/deploy.yml  GH Pages deploy on push to main
adr/                          architectural decisions
```

## Key patterns

- **Data flow:** CSV → `parseEntities`/`parseClaims` → `DataContext` → `useData()` hook → views. See [ADR-007](adr/007-react-context-state.md).
- **Routing:** HashRouter for static hosting. All routes under `#/…`. See [ADR-003](adr/003-hash-router.md).
- **Data model:** Entities hold no structure. All relationships (team membership, project work, reporting, ownership) are rows in `claims.csv` with per-fact `verified` dates. See [ADR-004](adr/004-two-csv-data-model.md).
- **Staleness:** `StaleTag` reads a claim's `verified` date and renders a color-coded age (fresh <30d hidden, warn 30-60, old 60-90, stale >90).
- **Entity cross-linking:** Always use `<EntityLink entity={...} />` — never hand-roll `<Link to="/person/...">`. It handles type-based routing and the person/project/squad color coding.
- **Filtering claims:** Use `filterClaims(claims, { subject?, relation?, object? })` from `utils/derive.ts`. Don't re-implement filter logic inline.
- **Demo mode:** If `localStorage['team-map-v1']` is missing, sample data loads into memory only (`isDemo: true`). Any user import replaces it permanently. See [ADR-011](adr/011-sample-data-demo-mode.md).
- **Deploy:** `vite.config.ts` has `base: '/team-map-viewer/'` — must match the GitHub repo name. See [ADR-002](adr/002-vite-build-tool.md) and [ADR-009](adr/009-gh-pages-deploy.md).

## Conventions

- **TS strict mode** (`strict: true`, `jsx: "react-jsx"`, `moduleResolution: "bundler"`).
- **Function components only**, hooks for state.
- **2-space indent**, single quotes, semicolons, trailing commas (Vite/React default, not enforced by a linter).
- **File naming:** PascalCase for components/views (`TeamOverview.tsx`), camelCase for utils (`derive.ts`).
- **Class names:** BEM-ish — `.team-card__header`, `.entity-link--person`.
- **No data in the repo.** `data/*.csv` contains fictional template rows only. Real org data goes into a separate private Git repo and is imported through the UI.
- **No real company names, emails, or identifiers** in commits, sample data, or comments.
