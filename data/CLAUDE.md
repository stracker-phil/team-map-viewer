# data/team.json

Template file. Replace with real org data via the import UI (Settings → Import). No real names, emails, or identifiers should be committed here.

## Top-level shape

```json
{
  "config": { … },
  "entities": [ … ],
  "claims":   [ … ]
}
```

`config` is optional. `entities` and `claims` are required.

---

## config

All keys optional. Absent keys fall back to app defaults.

### brand

```json
"brand": { "name": "Acme Corp" }
```

| Key | Default | Effect |
|-----|---------|--------|
| `name` | `"Team Map"` | Topbar brand name |

### pages

```json
"pages": {
  "squads":   { "description": "One squad per product area." },
  "people":   { "description": "" },
  "projects": { "description": "" },
  "repos":    { "description": "" }
}
```

`description` renders as a muted subtitle below each view's title. Empty string hides it.

### theme.colors

All values are CSS color strings (hex, rgb, hsl, etc.). All keys optional — omit to keep the default.

```json
"theme": {
  "colors": {
    "bg":        "#fafafa",
    "surface":   "#E1E3E2",
    "sidebarBg": "#FFDBCC",
    "accent":    "#1F4842",
    "text":      "#1C1B18",
    "muted":     "#78716c",
    "link":      "",
    "accentFg":  ""
  }
}
```

| Key | CSS var | Used for |
|-----|---------|----------|
| `bg` | `--bg` | Page background |
| `surface` | `--surface` | Cards, blocks, table row hover |
| `sidebarBg` | `--sidebar-bg` | Links sidebar background |
| `accent` | `--accent` | Nav active state, icon highlights, hover borders, topbar brand dot |
| `text` | `--text` | Body text |
| `muted` | `--muted` | Secondary labels, metadata |
| `link` | `--link` | Link text color on surfaces. **Defaults to `accent` if unset.** Set this darker than `accent` when accent is a light/neon color — e.g. `accent: "#9fca28"` + `link: "#5a7a10"` |
| `accentFg` | `--accent-fg` | Text on accent-colored backgrounds (primary button hover). **Defaults to `bg` if unset.** Set when accent is too light for white text |

**Auto-derived vars** (computed from `--accent` and `--text` via `color-mix()` — no JSON key needed):

| CSS var | Value | Used for |
|---------|-------|----------|
| `--accent-subtle` | 8% accent + transparent | Demo banner bg, import success bg, entity-link hover bg |
| `--accent-subtle-border` | 16% accent + transparent | Demo banner border, import success border |
| `--accent-underline` | 30% accent + transparent | Link underline decorations, fresh stale indicator |
| `--surface-hover` | 5% text + transparent | Search result row hover |

These update automatically when `accent` or `text` changes — no extra config required.

### footer

```json
"footer": {
  "text":    "Created by Jane Smith",
  "builtAt": "2026-04-30"
}
```

| Key | Effect |
|-----|--------|
| `text` | Rendered as-is at the bottom of every page |
| `builtAt` | Rendered as "Data as of YYYY-MM-DD" next to `text` |

---

## entities

```json
{ "id": "alice", "name": "Alice Müller", "type": "person", "meta": "Engineering Manager" }
```

| Field | Notes |
|-------|-------|
| `id` | Unique slug. Used in URLs and claim subjects/objects. `repo/` prefix is stripped on import. |
| `name` | Display name |
| `type` | `person` · `squad` · `project` · `repo` |
| `meta` | General category — used for grouping in RoleList/OrgChart. Not the same as a role claim. For repos: short description. |

**Repo naming:** use `org/repo` format for `name` (e.g. `"example/api"`) — the app auto-generates a GitHub link from matching names, no explicit link claim needed.

---

## claims

```json
{ "subject": "alice", "relation": "works-on", "object": "project-alpha", "detail": "TL", "source": "Wiki: /team/alpha", "verified": "2026-04-01" }
```

| Field | Notes |
|-------|-------|
| `subject` | Entity id |
| `relation` | See relation types below |
| `object` | Entity id, or URL for `link` claims |
| `detail` | Short qualifier (role abbreviation, link label, etc.) — optional |
| `source` | Where this claim comes from — rendered in sources block |
| `verified` | ISO date string — drives the stale indicator dot |

### Relation types

| Relation | Subject | Object | Notes |
|----------|---------|--------|-------|
| `works-on` | person | project | Core membership claim |
| `member-of` | person | squad | Squad membership |
| `reports-to` | person | person | Used in org chart |
| `owned-by` | project or repo | squad | Squad ownership |
| `belongs-to` | repo | project | Repo → project grouping |
| `contributes-to` | person | repo | Repo contributor |
| `role` | person | role title string | Display title shown in person subtitle and squad member lists |
| `link` | any entity | URL | `detail` = label, `source` = type (`jira` · `slack` · `confluence` · `github` · `website` · `wporg` · `personio`) |

### Link source types

`jira` · `slack` · `confluence` · `github` · `website` · `wporg` · `personio` — controls the icon shown in the links sidebar. Unknown values fall back to a generic link icon.
