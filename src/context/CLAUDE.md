# src/context

## Data flow

JSON → `parseTeamJson` (utils/csv.ts) → `DataContext` → `useData()` hook → views. See [ADR-007](../../adr/007-react-context-state.md) and [ADR-019](../../adr/019-json-data-format.md).

## DataContext

Computes derived maps once (memoized): `entityMap`, `people`, `squads`, `projects`, `repos`, `teamSize`, `squadOf`, `personRoleMap`, `contributorCount`, `repoDepsMap`, `repoUsagesMap`. Views destructure from `useData()` — no per-view re-derivation. `filterClaims` from `utils/derive.ts` is still used for per-entity queries in detail views.

`repoDepsMap` (`repoId → { entity: Entity | null; label: string }[]`): outbound `uses` dependencies per repo — entity when object matches a known repo, string label otherwise. `repoUsagesMap` (`repoId → Entity[]`): reverse index — repos that declare `uses` pointing to a given repo.

`config: AppConfig | undefined` is also exposed. A `useEffect` on `config` injects `config.theme.colors` as CSS vars on `:root` (via `setProperty`/`removeProperty`). See [ADR-020](../../adr/020-config-block.md).

`isDemo: true` when no `localStorage['team-map-v1']` — sample data loads into memory only. Any user import replaces it permanently. See [ADR-011](../../adr/011-sample-data-demo-mode.md).

## StarContext

`useStar()` holds `Set<string>` of starred entity IDs, persisted to `localStorage['team-map-stars-v1']`. All list views and detail-page sub-lists sort starred entities first — include `starred` in each relevant `useMemo` dep array so re-sorting is reactive. See [ADR-018](../../adr/018-star-bookmarks.md).
