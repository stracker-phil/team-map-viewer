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
        "accent": "#…", "text": "#…", "muted": "#…",
        "link": "#…", "accentFg": "#…"
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
| `theme.colors.*` | Mapped to CSS vars and set on `:root` via `document.documentElement.style.setProperty` in a `useEffect` in `DataProvider`; absent keys call `removeProperty` to restore defaults. See color key table below. |
| `footer.text` | Rendered as-is at the bottom of every page |
| `footer.builtAt` | Rendered as "Data as of …" next to `footer.text` |

### theme.colors keys

| JSON key | CSS var | Notes |
|----------|---------|-------|
| `bg` | `--bg` | Page background |
| `surface` | `--surface` | Card / block backgrounds |
| `sidebarBg` | `--sidebar-bg` | Links sidebar background |
| `accent` | `--accent` | Decorative accent: nav active, icon highlights, hover borders |
| `text` | `--text` | Body text |
| `muted` | `--muted` | Secondary labels and metadata |
| `link` | `--link` | Link text color on surfaces. Falls back to `--accent` in CSS if unset. Set darker than `accent` when accent is a light/neon color. |
| `accentFg` | `--accent-fg` | Foreground text on accent-colored backgrounds (e.g. primary button hover). Falls back to `--bg` if unset. |

In addition, four vars are **auto-derived in CSS via `color-mix()`** — they update automatically when `--accent` or `--text` changes and cannot be overridden from JSON:

| CSS var | Derived from | Used for |
|---------|--------------|----------|
| `--accent-subtle` | 8% accent | Demo banner bg, import success bg, entity-link hover bg |
| `--accent-subtle-border` | 16% accent | Demo banner border, import success border |
| `--accent-underline` | 30% accent | Link underline decoration, fresh stale dot |
| `--surface-hover` | 5% text | Search result row hover |

### Persistence

`config` is stored inside the `localStorage['team-map-v1']` blob alongside `entities` and `claims`. `exportTeamJson` includes it as the first key when present, so the user can review/copy/edit it from the import textarea.

## Consequences

- Teams can brand and describe a deployment purely via `team.json` — no code change required.
- CSS var injection is applied at runtime, not build time — the default stylesheet is unchanged.
- Existing stored data without a `config` key loads correctly; `config` is `undefined` and all defaults apply.
- `AppConfig` type in `src/types.ts` is the single source of truth for allowed fields.
