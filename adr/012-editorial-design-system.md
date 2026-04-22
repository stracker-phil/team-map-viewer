# ADR-012: Editorial design system with web fonts and lucide-react icons

**Status:** Accepted

## Context

The initial UI used a tech-dashboard aesthetic (dark nav bar, indigo accent, cold grays). A reference prototype demonstrated that an editorial / print-inspired design (warm cream background, display serif headings, monospace labels) significantly improved readability and visual hierarchy for an org-chart tool.

## Decision

Replace the dashboard design system with an editorial one:

- **Background:** warm cream `#F5F1EA` replacing cold `#f8fafc`.
- **Accent:** dark teal `#1F4842` replacing indigo.
- **Fonts (Google Fonts):** Fraunces (display serif for headings and entity names), Geist (body text), JetBrains Mono (eyebrows, counts, labels). Loaded via `<link>` in `index.html`.
- **Icons:** `lucide-react` package for consistent SVG icons (Search, Upload, Download, entity type icons). Chosen over Unicode glyphs for accessibility, sizing, and visual coherence.
- **Entity links:** uniform teal underline for all entity types (replaces per-type blue/green/purple coloring). The type distinction comes from context (section label, icon) rather than link color.
- **Staleness indicator:** small colored dot (6 px circle) replaces the pill badge — less visual noise, title tooltip preserves the data.
- **Nav:** flat horizontal nav with zero-padded entity counts in mono type, replacing the dark sticky header.
- **Import:** modal overlay triggered from the header IMPORT button, rather than a dedicated `/import` page navigation.

CSS is still plain custom-property CSS in `src/styles.css` — no CSS framework added (ADR-008 still applies).

## Consequences

- Google Fonts adds a DNS lookup and font download; the preconnect hints in `index.html` minimize the FTTP impact.
- `lucide-react` adds ~220 kB to the JS bundle (gzipped ~70 kB total including all dependencies).
- The `EntityLink` component no longer accepts a `badge` prop — callers that used type-colored badges must use plain entity links or section-level labeling instead.
- Import is always a modal when triggered from the nav; the `/import` route still exists as a full page for direct navigation.
