# ADR-002: Vite as build tool

**Status:** Accepted

## Context

Need a fast dev server with HMR, zero-config TypeScript/JSX, and a small production bundle for GH Pages.

## Decision

Use Vite 5.4 with `@vitejs/plugin-react`. Config in `vite.config.ts` sets `base: '/team-map-viewer/'` so built asset URLs resolve correctly under the GitHub Pages subpath. Build script is `tsc && vite build` — TS runs first as a type check, then Vite produces `dist/`.

## Consequences

- Dev server starts in ~150ms; production build in <1s.
- `base` must match the repo name; forking requires updating this value.
- `tsc --noEmit` gate means type errors block deploy, even though Vite itself doesn't type-check.
- Output is a static `dist/` — no SSR, no server runtime.
