# ADR-021: KbdChip — inline keyboard shortcut display and interception

**Status:** Established (2026-05-04)

## Context

Several UI elements are triggered by keyboard shortcuts (⌘K for search, ⌘F for list filter, ESC to close search overlay). These shortcuts were previously wired via ad-hoc `useEffect` calls in each component, with no visual indicator for discoverability.

## Decision

Introduce a single `<KbdChip>` component (`src/components/KbdChip.tsx`) that:

1. **Renders** a `.kbd-chip` span showing the shortcut label (e.g. `⌘K`, `⌘F`, `ESC`).
2. **Intercepts** the matching key via a single `window.addEventListener('keydown', …)` mounted on component mount, removed on unmount.
3. Uses internal refs for `match`, `onTrigger`, and `preventDefault` so the effect runs exactly once and always calls the latest version — no stale-closure issues and no re-subscription on re-render.

The component is mounted where its shortcut logically belongs:
- **⌘1–⌘4** — inside each topbar nav link (Squads/People/Projects/Repos). Navigate to `#/`, `#/roles`, `#/projects`, `#/repos` respectively. `preventDefault` suppresses browser tab-switching behavior.
- **⌘K** — inside the topbar search button (button grows to contain chip + icon).
- **⌘F** — absolutely positioned inside the `ListSearch` input wrapper (right edge, pointer-events none).
- **ESC** — inside the search overlay input row, shown when the input is empty.

Mounting location determines listener lifetime automatically: the ⌘F listener only exists on pages that render `<ListSearch>`; ESC only exists while the overlay is open.

## Consequences

- Keyboard wiring and its visual affordance are co-located — adding or removing a shortcut removes both the listener and the chip.
- No global shortcut registry needed.
- Components that previously managed their own `useEffect` for keyboard handling (Layout ⌘K) are simplified.
- `.kbd-chip` CSS class is shared across all instances; visual style is consistent.
