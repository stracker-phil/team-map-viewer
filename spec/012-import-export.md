# SPEC-012: Import

**Status:** Established

## Overview

Users supply their own org data by pasting or uploading a `team.json` file. The app is a read-only viewer — there is no export function.

## Import modal

- Accessible via the "IMPORT" button in the header, the demo banner link, or the standalone `#/import` route.
- When opened from the header, renders as a modal overlay (backdrop blur, centered). When navigated to directly, renders as a full page.
- Contains one full-width textarea for JSON content and a single "UPLOAD" file input (accepts `.json`).
- When real data is already loaded (not demo mode), the textarea is pre-populated with `exportTeamJson(entities, claims)` so the user can review, select, or copy the JSON that is currently active.
- In demo mode the textarea is empty.

## JSON format

```json
{
  "entities": [
    { "id": "...", "name": "...", "type": "...", "meta": "..." }
  ],
  "claims": [
    { "subject": "...", "relation": "...", "object": "...", "detail": "...", "source": "...", "verified": "..." }
  ]
}
```

See SPEC-001 for entity fields, claim fields, and valid relation types.

## `repo/` prefix normalisation

`parseTeamJson` strips a `repo/` prefix from entity `id` values and from `subject`/`object` fields in claims at import time. The prefix never enters the app's data context or URLs.

## Validation and error handling

- If parsing produces zero entities and zero claims, an error message is shown and the import is not saved.
- If the JSON is malformed, an error message is shown with the parse exception.
- Rows missing required fields (`id`/`name`/`type` for entities; `subject`/`relation`/`object` for claims) are skipped and counted.
- Rows with an invalid `relation` value are skipped and counted.
- Skipped row count is appended to the success message.
- Claims referencing unknown entity IDs are silently dropped in views (no import-time error).

## Persistence

On successful import, entities and claims are JSON-serialised and written to `localStorage` under the key `team-map-v1`. Demo mode ends. The app immediately re-renders with the new data.

## Data reset

Clearing `localStorage` (e.g. via browser dev tools) and reloading the page returns the app to demo mode.
