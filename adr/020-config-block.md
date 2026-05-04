# ADR-020: Optional `config` block in team.json

**Status:** Accepted

## Context

The app previously rendered with fixed branding ("Team Map"), fixed default CSS vars, no page subtitles, and no footer. Different teams deploying the same viewer needed a way to tailor the appearance and add basic metadata without touching source code.

## Decision

Add an optional top-level `config` key to `team.json`. It is parsed by `parseTeamJson`, stored in `DataContext` alongside `entities` and `claims`, and exposed via `useData()`. If absent, all behaviour falls back to defaults.

### Shape

```json
{
  "config": {
    "brand": { "name": "Acme Corp" },
    "pages": {
      "squads":   { "description": "…" },
      "people":   { "description": "…" },
      "projects": { "description": "…" },
      "repos":    { "description": "…" }
    },
    "theme": {
      "colors": {
        "bg": "#…", "surface": "#…", "sidebarBg": "#…",
        "accent": "#…", "text": "#…", "muted": "#…"
      }
    },
    "footer": {
      "text": "…",
      "builtAt": "YYYY-MM-DD"
    }
  }
}
```

All keys are optional. Partial overrides are safe — only present keys take effect.

### Runtime behaviour

| Field | Effect |
|---|---|
| `brand.name` | Replaces "Team Map" in topbar |
| `pages.{view}.description` | Muted subtitle rendered below `section-intro__title` |
| `theme.colors.*` | Mapped to CSS vars and set on `:root` via `document.documentElement.style.setProperty` in a `useEffect` in `DataProvider`; absent keys call `removeProperty` to restore defaults |
| `footer.text` | Rendered as-is at the bottom of every page |
| `footer.builtAt` | Rendered as "Data as of …" next to `footer.text` |

### Persistence

`config` is stored inside the `localStorage['team-map-v1']` blob alongside `entities` and `claims`. `exportTeamJson` includes it as the first key when present, so the user can review/copy/edit it from the import textarea.

## Consequences

- Teams can brand and describe a deployment purely via `team.json` — no code change required.
- CSS var injection is applied at runtime, not build time — the default stylesheet is unchanged.
- Existing stored data without a `config` key loads correctly; `config` is `undefined` and all defaults apply.
- `AppConfig` type in `src/types.ts` is the single source of truth for allowed fields.
