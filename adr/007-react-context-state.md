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
