# ADR-009: GitHub Pages deploy via GitHub Actions

**Status:** Accepted

## Context

Project is a static SPA with no backend. The repo is private; GitHub Pages on private repos requires a paid plan (Pro/Team/Enterprise). Need automated deploys on every push to `main`.

## Decision

`.github/workflows/deploy.yml` runs on push to `main`: checks out, installs, runs `npm run build`, publishes `dist/` to the `gh-pages` branch via `peaceiris/actions-gh-pages@v3`. Uses the default `GITHUB_TOKEN` — no PAT needed.

## Consequences

- Push to `main` = live site in ~1 minute.
- Private repo + Pages requires a paid GitHub plan.
- The deployed URL is technically accessible to anyone with the link, but the app has no bundled data — it's inert until the user imports.
- No preview deploys for PRs (not configured).
