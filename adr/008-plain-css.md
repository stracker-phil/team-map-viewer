# ADR-008: Plain CSS with custom properties

**Status:** Accepted

## Context

UI is small (~7 views) and visual design is straightforward. A CSS framework (Tailwind, MUI) adds bundle size, config, and cognitive overhead. CSS-in-JS adds a runtime cost.

## Decision

Single global stylesheet at `src/styles.css` imported once from `src/App.tsx`. Design tokens declared as CSS custom properties on `:root` (colors, radii, shadows). BEM-ish class names (`.team-card__header`, `.entity-link--person`).

## Consequences

- ~10 KB CSS ungzipped. No build-time class generation.
- Theming is a matter of overriding CSS variables — simple dark mode is trivial to add later.
- No component-level style scoping — class-name collisions are a manual concern.
- No PurgeCSS needed; all rules are hand-written.
