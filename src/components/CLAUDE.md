# src/components

## EntityPopup

`<EntityPopup as="..." entity={...} meta={...} popup={<Content />}>` wraps any trigger. Builds the sticky `.popup__header` Link internally — no separate PopupHeader. 1000ms open delay, 50ms close delay. Renders as `position: absolute` portal at `document.body`. Vertical position anchors to mouse Y at open time (tracked via `onMouseMove` during delay); horizontal anchors to trigger `rect.left`. Falls back to trigger rect for keyboard focus. Above/below decided once on open. Popup unmounts on close. `disabled` suppresses. Optional `onClick` forwarded to trigger (used by SquadCard). The popup div calls `e.stopPropagation()` on all clicks — React portals bubble through React tree, not DOM tree, so without this, nested popup clicks leak to ancestor trigger `onClick`. See [ADR-016](../../adr/016-entity-popup.md).

## *DetailMain pattern

`PersonDetailMain`, `ProjectDetailMain`, `RepoDetailMain`, `SquadDetailMain` serve double duty:
- **Full mode:** renders `<div className="detail-main">` for the detail page. Accepts `filterQuery?: string` — case-insensitive substring applied to all entity names in every section. The view shell manages filter state and renders `<ListSearch>` between the page header and `.detail-layout`.
- **Compact mode:** returns body only — `.popup__body` (optionally `--split`) with `.popup__col` children. Header built inside `EntityPopup` from `entity`/`meta` props — never include header markup in compact output. `filterQuery` is ignored in compact mode.

Sections use `.block` class — card surface in full mode; `.popup .block` strips it in compact. `.block--bare` strips explicitly (used for SquadCard stack). People groups always stacked (role sublabel → list), not a grid. All `useMemo` calls before any conditional early return. See [ADR-017](../../adr/017-detail-main-pattern.md).

**PersonDetailMain full mode:** `.cols-2` when both sides have content (left: squads + other repos + people; right: projects). Falls back to `.stack`.

## Entity item components

All person/project/repo list items: `<PersonItem>`, `<ProjectItem>`, `<RepoItem>` in `<ul className="entity-list">`. Never hand-roll list items for entity content. `PersonItem.claim` optional — omit when no per-row claim in scope. All three wrap `EntityPopup` — nested popups supported, do not pass `disablePopup`. See [ADR-015](../../adr/015-entity-item-components.md).

Always use `<EntityLink entity={...} />` — never hand-roll `<Link to="/person/...">`. All entity links render as teal underlines.

## SquadCard

Wraps `EntityPopup as="button"` — click navigates to squad detail, hover (1000ms) shows `SquadDetailMain compact` popup. Stats line dynamic: zero-count items omitted. Calls `useData()` internally — no data props at call sites. `StarIndicator` shown before name.

## Stars

`StarButton` (detail pages): toggles star, amber filled when starred; calls `useStar()`.  
`StarIndicator` (list items): read-only amber ★ in PersonItem, ProjectItem, RepoItem, SquadCard; calls `useStar()`. See [ADR-018](../../adr/018-star-bookmarks.md).

## Detail page sections

`.block` class: card background `var(--surface)`, `.block__heading`, `.block__empty`. `.popup .block` strips surface. `.block--bare` strips explicitly. `LinksSidebar` uses `background: var(--sidebar-bg)` via `.links-sidebar`; sticky offset from `.detail-aside` in `layout.css`.

## List filtering components

`<ListSearch value onChange placeholder?>` — controlled text input for filtering. Owns the `.list-toolbar` wrapper div. Mounts a `<KbdChip>` for `⌘F`/`Ctrl+F` absolutely positioned inside the input (right edge). Used in list views (RoleList, ProjectsList, ReposList) and all detail views (PersonDetail, ProjectDetail, RepoDetail, SquadDetail). On detail pages, placed between the page-header and `.detail-layout`.

`<FilterChips items active onChange allLabel? allCount>` — renders `.role-filters` chip row. `items: FilterChipItem[]` = `{ value, label, count }`. `active` = currently selected value or `null` (= ALL). Clicking active chip returns to `null`. Returns `null` when `items` is empty. Used by all three list views for category/owner/PHP filtering.

## KbdChip

`<KbdChip label match onTrigger preventDefault?>` — renders `.kbd-chip` span and mounts one stable `window` keydown listener (via internal refs, effect runs once). Listener lifetime = component mount/unmount, so placement determines scope automatically. See [ADR-021](../../adr/021-kbd-chip-shortcut-pattern.md).

## OrgChart

Three levels: TL (root, md nodes) → PM/PO (middle, md nodes) → dev/QA/design (branch columns, sm nodes). Missing levels collapse gracefully. `OrgNode` uses `EntityPopup`. See [SPEC-008](../../spec/008-project-detail.md).
