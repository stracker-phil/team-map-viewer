# ADR-015: Canonical entity item components

**Status:** Accepted

## Context

Entity lists appear in multiple views — SquadDetail people/projects columns, PersonDetail projects/repos/people sections, RepoDetail contributors. Without canonical components each view hand-rolled its own list item with slight structural differences, making a consistent appearance change require touching every view.

## Decision

Three canonical `<li>` components cover the standard entity-in-a-list case:

- `PersonItem` (`src/components/PersonItem.tsx`) — Avatar + EntityLink + optional detail + StaleTag
- `ProjectItem` (`src/components/ProjectItem.tsx`) — EntityLink + optional detail + StaleTag
- `RepoItem` (`src/components/RepoItem.tsx`) — EntityLink + optional detail + StaleTag

All render `<li className="entity-item">` via `EntityPopup as="li"` and are mounted inside `<ul className="entity-list">`. They accept an optional `style` prop. `PersonItem` no longer exposes `disablePopup` — nested person popups are enabled (see ADR-016).

`PersonItem.claim` is optional — when absent, `StaleTag` is omitted (used on the People view where no per-person claim is in scope).

All three are wrapped in `EntityPopup` (see ADR-016), so every usage automatically shows a hover/focus popup after 1000 ms. Nested popups (entity items inside a compact popup) are fully supported — mouse bridging works because the portal-rendered inner popup's `onMouseEnter` cancels the outer popup's close timer via each instance's independent timer.

Popup content per type:
- `PersonItem` → `<PersonDetailMain personId={...} compact />`
- `ProjectItem` → `<ProjectDetailMain projectId={...} compact />`
- `RepoItem` → `<RepoDetailMain repoId={...} compact />`

Every entity list in every view uses these components. Hand-rolled list items are not permitted for entity content. This includes `RoleList` (previously violated — now corrected) and `OrgChart.OrgNode` (uses `EntityPopup` directly since it is a card, not a list item).

## Consequences

- Changing the appearance of person/project/repo items app-wide requires editing one file.
- New per-entity annotations (type badges, icons, role chips) can be introduced globally in one place.
- The `.squad-card__list-item` and `.claim-item` CSS classes remain in `styles.css` for the legacy `.claim-item__content` / `.claim-item__detail` sub-classes still referenced by the item components, but are no longer used as root list-item classes in TSX.
