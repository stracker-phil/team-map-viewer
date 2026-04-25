# SPEC-005: Search

**Status:** Established

## Overview

Inline search lives in the nav bar and provides instant results in a dropdown, plus a full results page for broader exploration.

## Inline dropdown

- The search input is always visible in the nav bar.
- Typing shows a dropdown of up to 8 matching entities beneath the input.
- Matching is case-insensitive substring match across `name`, `id`, and `meta`.
- Results are deduplicated by entity ID — if `entities` contains duplicate IDs, only the first match is shown.
- Each result row shows a type icon, entity name (Fraunces serif), and `type · meta` in monospace.
- The dropdown closes on blur (150 ms debounce to allow click registration).
- After navigating via Enter (which clears the input), typing a new character reopens the dropdown.

## Keyboard navigation

| Key           | Behavior                                                               |
|---------------|------------------------------------------------------------------------|
| `Cmd+L` / `Ctrl+L` | Focus and select-all the search input from anywhere in the app    |
| `↓`           | Move highlight to next result (stops at last)                          |
| `↑`           | Move highlight to previous result (stops at index −1, clears highlight) |
| `Enter`       | Navigate to highlighted result; if none highlighted, go to full results page |
| `Escape`      | Clear input and close dropdown                                         |

Mouse hover over a dropdown item also sets the highlight.

## Highlighted state

The highlighted dropdown item has a slightly darker background (`rgba(28,27,24,0.06)`), identical to the hover style.

## Full results page (`#/search?q=…`)

- Reached by pressing Enter with no dropdown item highlighted, or by any code calling `navigate('/search?q=…')`.
- Shows all matching entities (no 8-item cap), each as a row with icon, name, meta, and entity type badge.
- Shows "Nothing found" empty state if the query matches nothing.
- Query is taken from the `q` URL parameter; changing the URL updates results without a page reload.
