# ADR-016: EntityPopup — hover/focus detail popups on entity items

**Status:** Accepted (amended 2026-04-27 — portal rendering, open delay, compact popup layout; extended to ProjectItem and RepoItem; nested popups enabled; fixed→absolute positioning, scroll listeners removed; popup titles are nav links; SquadCard added; onClick prop; click stopPropagation)

## Context

Discovery flows in the app required navigating to a detail page to see any information about a person. The squad detail, people view, org chart, and repo detail pages all show person lists but reveal nothing without a full navigation. Users asked for a way to drill into person details inline without leaving the current page.

## Decision

A reusable `<EntityPopup>` wrapper component provides hover/focus-triggered popups for any entity item. The first consumer is `PersonItem`, which shows `PersonDetailMain` in compact mode as the popup content.

### Components

**`src/components/EntityPopup.tsx`**
- Generic wrapper rendered as any element via `as` prop (default `div`).
- Accepts a `popup` render prop — rendered lazily; unmounted when popup closes.
- **1000 ms open delay** on `mouseEnter`/`focus`. Leaving before the delay expires cancels the pending open.
- **50 ms close delay** bridges the pointer gap when moving from trigger into popup.
- **Portal rendering** — popup is rendered via `createPortal` at `document.body`, styled `position: absolute`. Portal avoids scroll-jank from layout effects; absolute positioning lets the browser scroll the popup naturally with the page, eliminating JS scroll tracking.
- **Position computed on open:** `getBoundingClientRect()` of the trigger + `window.scrollX`/`scrollY` gives page-absolute coords set once. Left is clamped to viewport bounds (then offset by `scrollX`). Above/below decision is made once (comparing trigger's absolute page bottom against `document.scrollHeight`).
- `useLayoutEffect` corrects `top` with the actual rendered popup height before first paint (eliminates initial flash for above-trigger popups).
- No scroll or resize listeners — page scroll naturally moves the absolute-positioned popup with the content. Resize is not tracked.
- `onBlur` uses `relatedTarget` containment check so keyboard focus moving into the popup does not close it.
- `disabled` prop suppresses the popup.
- **`onClick` prop** — forwarded to the trigger element, enabling non-link triggers (e.g. `<button>`) to handle click navigation while EntityPopup handles hover.
- **Click stopPropagation** — the portal `div.entity-popup` calls `e.stopPropagation()` on every click. React portals bubble synthetic events through the React component tree (not the DOM tree), so without this, clicks inside a nested popup propagate all the way up to ancestor triggers and fire unintended `onClick` handlers. Stopping at the popup boundary ensures each click is handled only at its own level.

**`src/components/PersonDetailMain.tsx`**
- Extracted from `PersonDetail` — contains all data derivation and section JSX.
- Accepts `personId: string` and optional `compact?: boolean`, calls `useData()` internally.
- **Compact mode** (used in popup): renders a `.person-popup` layout — sticky gray title bar (Avatar + name + role title as `<Link>` navigating to the person page), two-column body (left: squads/repos/people; right: projects separated by a 1 px divider). Sections use plain labels, no `dl-section` card backgrounds.
- Nested popups are fully supported — PersonItems inside compact mode do not suppress popups.
- Full (non-compact) mode renders the existing `.detail-main` layout used on the PersonDetail page.

### Popup styling

`.entity-popup` is `position: absolute; width: 680px; background: #fff; border: 1px solid var(--border-solid)`. Page-absolute `top`/`left` set via inline style from JS. Inside: `.*-popup__title` (sticky, `background: var(--surface)`, rendered as `<Link>` — full row is clickable, navigates to the entity's detail page, hover darkens background), `.*-popup__body` / two-column flex layout.

### Popup is unmounted on close (not hidden)

Unmounting resets all internal state. Reopening always starts fresh.

### Where EntityPopup is applied

- `PersonItem` (all instances) — popup: `PersonDetailMain compact`
- `ProjectItem` (all instances) — popup: `ProjectDetailMain compact`
- `RepoItem` (all instances) — popup: `RepoDetailMain compact`
- `SquadCard` (all instances) — `EntityPopup as="button"` with `onClick` navigate; popup: `SquadDetailMain compact`
- `OrgChart.OrgNode` — via `EntityPopup as="div"` wrapping the `org-node` div

## Consequences

- Every PersonItem, ProjectItem, RepoItem, and SquadCard on every page shows a hover popup after 1000 ms.
- Recursive drill-down (nested popups) works — person → squad → person → project chains are functional.
- Scroll glitch (page jumping when popup opened/closed) eliminated by portal rendering.
- No JS re-renders on scroll — the popup follows the trigger via CSS natural scroll, not event listeners.
- Popup title row is always a nav link — quick navigation to the entity detail page without closing the popup first.
- `PersonItem.claim` is optional; `StaleTag` renders only when a claim is present.
