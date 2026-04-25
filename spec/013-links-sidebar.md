# SPEC-013: Links sidebar

**Status:** Established

## Overview

Every entity detail page (squad, project, person) has a persistent sidebar that lists external links recorded for that entity.

## Data

Links come from `links.csv` / the links array in `DataContext`. Each link has `entity_id`, `type`, `url`, and `label`.

## Display

- Links are grouped by `type`, then displayed in a fixed priority order: jira → slack → confluence → github → website → wporg → personio. Unknown types follow in insertion order.
- Each group shows a type label (e.g. "Jira", "Slack") and a type-specific icon.
- Each link renders as `<a href target="_blank" rel="noopener noreferrer">` showing the `label` text.
- If the entity has no links, the sidebar shows "No links recorded yet." in italic muted text.

## Type icons

| type        | icon           |
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
