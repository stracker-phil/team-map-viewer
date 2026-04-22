# ADR-003: HashRouter for client-side routing

**Status:** Accepted

## Context

GitHub Pages serves static files only — it cannot rewrite unknown paths to `index.html`, which `BrowserRouter` requires. Deep-linking to routes like `/person/alice` would 404 on reload.

## Decision

Use `HashRouter` from react-router-dom 6.26 (see `src/App.tsx`). All routes live under the URL fragment: `#/person/alice`, `#/project/project-alpha`, etc.

## Consequences

- Deep links and browser refresh work without server config.
- URLs are slightly less clean (`#/` prefix).
- Search params still work (`#/search?q=alice`) via `useSearchParams`.
- No need for a SPA fallback or custom 404.html.
