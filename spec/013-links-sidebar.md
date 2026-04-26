# SPEC-013: Links sidebar

**Status:** Established

## Overview

Every entity detail page (squad, project, person, repo) has a persistent sidebar that lists external links recorded for that entity.

## Data

Links come from `claims` filtered by `relation === 'link'` where `subject` matches the entity ID. Each link claim carries: `object` = URL, `detail` = display label, `source` = link group key.

**Auto-generated repo link:** If `LinksSidebar` is passed the `entity` prop and that entity is of type `repo` with a name matching `org/repo` format (regex `/^[^/]+\/[^/]+$/`), a synthetic GitHub link (`https://github.com/org/repo`) is prepended to the display. This link appears first in the GitHub group even if no explicit `link` claim with `source: github` exists.

## Display

- Links are grouped by `source` (link group key), then displayed in a fixed priority order: jira → slack → confluence → github → website → wporg → personio. Unknown types follow in insertion order.
- Each group shows a type label (e.g. "Jira", "Slack") and a type-specific icon.
- Each link renders as `<a href target="_blank" rel="noopener noreferrer">` showing the `detail` text as the label.
- If the entity has no links, the sidebar shows "No links recorded yet." in italic muted text.

## Type icons

| source      | icon           |
|-------------|----------------|
| jira        | LayoutList     |
| slack       | Hash           |
| confluence  | BookOpen       |
| github      | GitBranch      |
| website     | Globe          |
| wporg       | Package        |
| personio    | UserCheck      |
| (other)     | ExternalLink   |

## Position

The sidebar is the rightmost column of its detail page layout, with a fixed width of 30% of the container. It is `position: sticky; top: 1.5rem` on desktop so it stays visible while scrolling long content. On screens narrower than 768 px it drops below the main content and loses the sticky positioning.
