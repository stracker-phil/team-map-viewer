# ADR-007: React Context for global state

**Status:** Accepted

## Context

The app has a single global dataset (entities + claims) read by every view. A state library (Redux, Zustand, Jotai) would be overkill for one reducer-free store with no cross-slice coordination.

## Decision

Expose state through a single `DataContext` in `src/context/DataContext.tsx` with: `entities`, `claims`, `isDemo`, `setData`, `clearData`, `loadSample`. Views consume via the `useData()` hook. localStorage sync happens inside the provider.

## Consequences

- Zero new dependencies.
- All views re-render on any data change — acceptable at this scale (~50 rows).
- If the dataset grows or partial updates become common, this may need swapping for a store with selector-based subscriptions.

**Amendment (2026-04-26):** `DataContext` now also computes and exposes derived maps as `useMemo` values: `entityMap`, `people`, `squads`, `projects`, `repos`, `teamSize`, `squadOf`, `personRoleMap`, `contributorCount`. Views consume these directly from `useData()` instead of re-deriving per render. This eliminates duplicate computation across views and centralizes type validation — for example, `teamSize` only counts `works-on` claims where the target entity is of type `project`, so misrouted claims are silently ignored at the source rather than patched in individual views. The hook signature expanded accordingly; the raw `entities`, `claims`, and `links` arrays remain available for per-entity filtering with `filterClaims`.

**Amendment (2026-05-04):** Added two derived maps for the `uses` relation: `repoDepsMap` (`repoId → { entity: Entity | null; label: string }[]`) indexes each repo's outbound `uses` claims, resolving objects to entities where possible; `repoUsagesMap` (`repoId → Entity[]`) indexes the reverse — all repo entities that declare a `uses` claim pointing to a given repo. Both are consumed by `RepoDetailMain` to render Dependencies and Used-by sections.
