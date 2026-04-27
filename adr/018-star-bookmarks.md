# ADR-018: Star/bookmark system for entities

**Status:** Accepted

## Context

Users frequently revisit the same people, projects, squads, or repos. There was no way to surface these quickly — starred items were buried in alphabetical lists mixed with dozens of others.

## Decision

Add a lightweight bookmark ("star") system:

- **Storage:** A separate localStorage key `team-map-stars-v1` holds a JSON array of starred entity IDs. This is fully independent from `team-map-v1` (data) so clearing data does not clear stars, and vice versa.
- **Context:** `StarContext` (`src/context/StarContext.tsx`) wraps the entire app via `StarProvider` and exposes `{ starred: ReadonlySet<string>, isStarred(id), toggleStar(id) }` via `useStar()`. `starred` is a stable `Set` reference that changes identity on every toggle, making it a valid `useMemo` dependency.
- **Toggle:** Shown on detail pages only (`PersonDetail`, `ProjectDetail`, `SquadDetail`, `RepoDetail`) — a `StarButton` in the entity header (amber star icon, filled when active). Detail pages are the intentional place to decide "I care about this entity".
- **Indicator:** `StarIndicator` (read-only amber ★ icon) is embedded in shared list components — `PersonItem`, `ProjectItem`, `RepoItem`, `SquadCard`. It appears before the entity name whenever `isStarred` returns true. This makes the star visible in every context those components are used, including popup content.
- **Sort order:** All list views and detail-page sub-lists sort starred entities to the top before applying secondary alphabetical sort. This is implemented by including `starred` (the Set) in each relevant `useMemo` dependency array.

## Consequences

- Stars persist across sessions and survive data re-imports (IDs are stable).
- Stars are per-browser-per-device (same constraint as data storage).
- No UI clutter in list views — only the amber indicator, no interactive controls.
- Detail page is the canonical place to star/unstar, which matches the natural workflow: navigate to entity → decide to bookmark it.
- Sorting is reactive: toggling a star immediately re-sorts all visible lists without a page reload.
