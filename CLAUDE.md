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
  main.tsx / App.tsx / types.ts / sampleData.ts
  layout.css              structural layout primitives (page/topbar/detail-layout/block/popup/grids)
  styles.css              global theme — colors, typography, surface treatments
  context/                global state — see src/context/CLAUDE.md
  utils/                  helpers — see src/utils/CLAUDE.md
  components/             shared UI — see src/components/CLAUDE.md
  views/                  route views — see src/views/CLAUDE.md
data/team.json            template data, no real data
adr/                      architectural decisions (ADR-001 – ADR-019)
spec/                     behavioral specs (SPEC-001 – SPEC-015)
```

## Data model

- **Entities:** `person`, `project`, `squad`, `repo`. Hold no structure — all relationships are claims. See [ADR-004](adr/004-two-csv-data-model.md) and [ADR-019](adr/019-json-data-format.md).
- **Claims:** `{ subject, relation, object, detail?, source?, verified? }` in `team.json`.
- **Key relations:** `works-on` (person→project), `contributes-to` (person→repo), `belongs-to` (repo→project), `owned-by` (project/repo→squad), `member-of` (person→squad), `role` (person→title string), `link` (entity→URL).
- **Role vs meta:** `entity.meta` = general category (grouping in RoleList/OrgChart); `role` claim = specific display title (PersonDetail subtitle, squad card lists). `personRoleMap` in `useData()`.
- **Link claims:** `relation: link`, `subject`=entity id, `object`=URL, `detail`=label, `source`=type (jira/slack/confluence/github/website/wporg/personio/…).
- **Repo naming:** `org/repo` format. `LinksSidebar` auto-generates GitHub link for matching names — no explicit claim needed. See [ADR-004](adr/004-two-csv-data-model.md).
- **repo/ prefix:** `parseTeamJson` silently strips `repo/` prefix from IDs and claims at import. Never enters app state or URLs. See [SPEC-012](spec/012-import-export.md).

## Design system

`--bg: #fafafa`, `--surface: #E1E3E2` (cards), `--sidebar-bg: #FFDBCC` (links sidebar), teal accent `#1F4842`. Fraunces/Geist/JetBrains Mono fonts. Cards use background color for depth — no decorative borders. Fixed 48px topbar; CMD+K (`⌘K`/`Ctrl+K`) opens search overlay. See [ADR-012](adr/012-editorial-design-system.md).

Type badges: `.type-badge.type-badge--{type}`. CSS vars `--type-{person,squad,project,repo}-{bg,text}` on `:root`. Used in CMD+K results.

Deploy: `vite.config.ts` `base: '/team-map-viewer/'` must match GitHub repo name. See [ADR-009](adr/009-gh-pages-deploy.md).

## Conventions

- **TS strict mode** (`strict: true`, `jsx: "react-jsx"`, `moduleResolution: "bundler"`).
- **Function components only**, hooks for state.
- **2-space indent**, single quotes, semicolons, trailing commas.
- **File naming:** PascalCase for components/views (`TeamOverview.tsx`), camelCase for utils (`derive.ts`).
- **Class names:** BEM-ish — `.squad-card__header`, `.claim-item__detail`. Utility classes: `.font-display`, `.font-mono`.
- **No data in the repo.** Real org data imported through UI only. No real company names, emails, or identifiers in commits, sample data, or comments.
- **Rules of Hooks:** All `useMemo`/`useState`/`useCallback` before any conditional early return.
- **Behavioral specs:** Update relevant `spec/` file whenever behavior changes. See [ADR-013](adr/013-behavioral-specs.md).
