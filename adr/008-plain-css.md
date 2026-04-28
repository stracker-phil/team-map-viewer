# ADR-008: Plain CSS with custom properties

**Status:** Accepted (amended 2026-04-27 — split into layout.css + styles.css)

## Context

UI is small (~7 views) and visual design is straightforward. A CSS framework (Tailwind, MUI) adds bundle size, config, and cognitive overhead. CSS-in-JS adds a runtime cost.

## Decision

Two global stylesheets imported in order from `src/App.tsx`:

1. **`src/layout.css`** — structural primitives only: box-model, positioning, flex/grid, spacing. No colors, no fonts, no borders. Contains: topbar, page, page-header, detail-layout, block (layout only), popup positioning, overlay, modal-shell, search overlay layout, grids (`tile-grid`, `tile-grid--auto`), stacks, responsive breakpoints.
2. **`src/styles.css`** — theme only: colors, typography, surface treatments (background, border-radius, shadows), font-family rules. Defines design tokens as CSS custom properties on `:root`.

**Split rule:** if a property affects only visual appearance (color, background, border, font), it belongs in styles.css. If it affects box model, flow, or geometry, it belongs in layout.css. Ambiguous cases (e.g. `padding` on a card) follow the surface: padding tied to a card background lives in styles.css alongside that background.

BEM-ish class names (`.block__heading`, `.squad-card__stats`).

## Consequences

- ~25 KB CSS ungzipped total. No build-time class generation.
- Structural and visual concerns separated — rethemes touch only styles.css.
- Dark mode is a matter of overriding CSS variables in styles.css.
- No component-level style scoping — class-name collisions are a manual concern.
- No PurgeCSS needed; all rules are hand-written.
