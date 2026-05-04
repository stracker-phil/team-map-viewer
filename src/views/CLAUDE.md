# src/views

## Squad detail layout

`/squad/:id` uses `.detail-layout.detail-layout--3col` (3-col: `1fr 1fr 30%`). Column 2 stacks Projects then Repos via `.stack` (repos hidden when none). Repos shown if directly `owned-by` squad OR `belongs-to` any squad-owned project. See [SPEC-007](../../spec/007-squad-detail.md).

## Claim semantics in views

- **works-on vs contributes-to:** `works-on` targets `project`; `contributes-to` targets `repo`. PersonDetail shows separate "Projects" and "Other Repos" cards. `works-on` pointing to a repo is silently rerouted to Other Repos. `teamSize` only counts `works-on` where target is a `project`. See [SPEC-009](../../spec/009-person-detail.md).
- **belongs-to:** Connects repo (subject) to project (object). ProjectDetail shows "Repos" after owner; RepoDetail shows "Projects" above contributors. Both hidden when no `belongs-to` claims exist.
- **Project visibility:** ProjectsList shows projects that are squad-owned (`owned-by` claim) OR have at least one `works-on` member. Squad-owned projects with 0 detected members are shown so they remain discoverable. Unowned + 0-member projects are hidden.

## Entity tables

`ProjectsList` and `ReposList` use `<table className="entity-table">` with `table-layout: fixed`. Name column dynamic-width; all other columns 100px fixed. Name column `padding-left: 1em`. Rows are clickable.

## Import modal

`<ImportData onClose={fn} />` renders as modal overlay; `<ImportData />` (no prop) renders as full page. `Layout` manages `showImport` state. When `isDemo: false`, textarea initializes with current JSON for review/copy. Empty in demo mode. No export button — `exportTeamJson` only populates the textarea. See [ADR-014](../../adr/014-static-read-only-viewer.md).

## Routing

HashRouter for static hosting. All routes under `#/…`. See [ADR-003](../../adr/003-hash-router.md).

| Route | View |
|---|---|
| `/` | TeamOverview — squad grid |
| `/roles` | RoleList — grouped by role with filter chips |
| `/projects` | ProjectsList — owner filter, table |
| `/repos` | ReposList — table, no filter |
| `/person/:id` | PersonDetail |
| `/project/:id` | ProjectDetail |
| `/squad/:id` | SquadDetail |
| `/repo/:id` | RepoDetail |
| `/import` | ImportData |
| `/search?q=…` | SearchResults |
