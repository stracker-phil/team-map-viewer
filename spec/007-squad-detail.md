# SPEC-007: Squad detail

**Status:** Established

## Overview

The squad detail page (`#/squad/:id`) shows a squad's full roster and project portfolio in a three-column layout, with interactive cross-highlighting between the two.

## Layout

Three columns:
1. **People** — all `member-of` claims for the squad.
2. **Projects** — all `owned-by` claims where the squad is the object.
3. **Links** — `LinksSidebar` for the squad entity (same 30% width as on other detail pages).

On screens narrower than 768 px the three columns stack vertically.

## People column

- Heading: "PEOPLE · {count}" in monospace.
- Members are grouped by job title (`person.meta`). Groups sorted alphabetically by title. Members within each group sorted alphabetically by name.
- Group label renders as a small monospace section label above the list.
- Each person row: avatar · name link · staleness dot (from `member-of` claim).
- People with no `meta` are grouped under "Other".

## Projects column

- Heading: "PROJECTS · {count}" in monospace.
- One project per line: chevron icon · project name link · staleness dot (from `owned-by` claim).
- Sorted alphabetically by project name.

## Cross-highlight interaction

When the user hovers or focuses any person row, all project rows for projects that person does **not** have a `works-on` claim to are dimmed to `opacity: 0.4`. Project rows the person does work on stay at full opacity.

When the user hovers or focuses any project row, all person rows for people who do **not** have a `works-on` claim to that project are dimmed to `opacity: 0.4`.

- Dimming uses a CSS `transition: opacity 0.15s` for a smooth fade.
- Only `works-on` claims are used for the connection — `member-of` alone does not create a person↔project link for this interaction.
- A person with no `works-on` claims causes all projects to dim. A project with no `works-on` claims causes all people to dim.
- Mouse-leave or blur restores all items to full opacity.
- Focus events bubble from child links, so keyboard Tab navigation through entity links triggers the same behavior as hovering.
