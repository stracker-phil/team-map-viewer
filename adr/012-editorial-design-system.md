# ADR-012: Editorial design system with web fonts and lucide-react icons

**Status:** Amended (UI overhaul, April 2026)

## Context

The initial UI used a tech-dashboard aesthetic (dark nav bar, indigo accent, cold grays). A reference prototype demonstrated that an editorial / print-inspired design (warm cream background, display serif headings, monospace labels) significantly improved readability and visual hierarchy for an org-chart tool.

A follow-up overhaul (April 2026) moved toward a more functional internal-tool aesthetic while retaining the editorial typography — replacing the large display header with a compact fixed nav bar, shifting to neutral card surfaces, and adding a CMD+K search overlay.

## Decision

### Typography and icons (unchanged)

- **Fonts (Google Fonts):** Fraunces (display serif for headings), Geist (body), JetBrains Mono (labels, counts). Loaded via `<link>` in `index.html`.
- **Icons:** `lucide-react` for all SVG icons.
- **Entity links:** uniform teal underline for all entity types.

### Color palette (updated April 2026)

| Token | Value | Use |
|---|---|---|
| `--bg` | `#fafafa` | Page background |
| `--surface` | `#E1E3E2` | Card backgrounds (squad cards, dl-section boxes, project cards) |
| `--sidebar-bg` | `#FFDBCC` | Links sidebar |
| `--accent` | `#1F4842` | Teal accent (links, active nav, icons) |
| `--text` | `#1C1B18` | Body text |

Cards use background color to create depth — no decorative borders. Borders appear only on functional boundaries (topbar, input outlines, modal edges).

### Entity type color badges

Each entity type has a distinct badge color (CSS variables on `:root`):

| Type | Background variable | Text variable |
|---|---|---|
| `person` | `--type-person-bg` `#DBEAFE` | `--type-person-text` `#1e40af` |
| `squad` | `--type-squad-bg` `#DCFCE7` | `--type-squad-text` `#166534` |
| `project` | `--type-project-bg` `#FEF3C7` | `--type-project-text` `#92400e` |
| `repo` | `--type-repo-bg` `#EDE9FE` | `--type-repo-text` `#5b21b6` |

Badges rendered as `.type-badge.type-badge--{type}` chips, currently used in the CMD+K search overlay results.

### Navigation (updated April 2026)

- Replaced: large Fraunces display title + horizontal nav strip.
- New: fixed 48 px topbar (`position: fixed; height: 48px`) containing brand wordmark, nav links with counts, Import button, and search icon. Page content has `padding-top: 48px`.
- Search trigger: clicking the search icon or pressing `⌘K` / `Ctrl+K` opens a full-screen overlay with blurred backdrop and auto-focused input. `Escape` closes it. The old inline search bar in the nav is gone.
- No footer — entity/claim counts were redundant with the nav counts.

### Section and page titles

- All list-view page titles are `h1.section-intro__title` with a type icon inline (no separate eyebrow label).
- All detail-page entity titles are `h1.entity-header__title` (no eyebrow label). Icon is a sibling span, not inline.
- All eyebrow `<div>` containers removed from all views.

### Cards and layout

- Squad overview cards: simplified to fixed-height clickable card showing name + "X People · Y Projects". Tab UI removed.
- Detail-page sections: each section (Projects, GH Repos, People, Contributors, Owner) wrapped in a `.dl-section` card with `background: var(--surface)`.
- Links sidebar: `background: var(--sidebar-bg)` (`#FFDBCC`), `position: sticky` offset by topbar height (`top: calc(48px + 1.5rem)`).
- Squad cards and project cards use `filter: brightness(0.97)` on hover instead of background swap.

## Consequences

- Google Fonts and `lucide-react` bundle impact unchanged from original.
- The `EntityLink` component has no type-badge prop — type identity comes from `.type-badge` chips in the CMD+K overlay.
- The `⌘L` search shortcut is replaced by `⌘K` (more conventional palette-style trigger).
- Squad cards no longer expand inline — the squad detail page is the only place to see members and projects.
- CSS custom properties make palette changes trivial via `config.theme.colors` in `team.json`. See [ADR-020](020-config-block.md) for the full key list, including `link` (link text color, defaults to `--accent`) and `accentFg` (text on accent backgrounds, defaults to `--bg`).
- Four alpha-tinted variants (`--accent-subtle`, `--accent-subtle-border`, `--accent-underline`, `--surface-hover`) are derived at paint time via CSS `color-mix()` from `--accent` and `--text`. All formerly hardcoded `rgba(31,72,66,X)` teal values now reference these vars, so they update automatically with any accent override.
