# SPEC-012: Import

**Status:** Established

## Overview

Users supply their own org data by pasting or uploading CSV files. The app is a read-only viewer — there is no export function.

## Import modal

- Accessible via the "IMPORT" button in the header, the demo banner link, or the standalone `#/import` route.
- When opened from the header, renders as a modal overlay (backdrop blur, centered). When navigated to directly, renders as a full page.
- Contains two text areas: Entities CSV and Claims CSV.
- Each text area accepts pasted CSV or a file uploaded via a "Upload file" label.
- When real data is already loaded (not demo mode), the text areas are pre-populated with the current data so the user can review, select, or copy the CSV that is currently active.

## CSV format

### entities.csv

```
id,name,type,meta
```

### claims.csv

```
subject,relation,object,detail,source,verified
```

External links are `link` claims: `subject` = entity ID, `object` = full URL, `detail` = display label, `source` = link group key. See SPEC-001 for relation types.

The app uses PapaParse with `header: true` and `skipEmptyLines: true`. Column order is not required to match; header names are matched by name.

## `repo/` prefix normalisation

`parseEntities` strips a `repo/` prefix from entity `id` values. `parseClaims` strips it from `subject` and `object` fields. This handles source data that namespaces repo IDs — the prefix is discarded before any data enters the context or routing.

## Validation and error handling

- If parsing produces zero entities, an error message is shown and the import is not saved.
- If claims reference entity IDs not in the imported entities, those claims are silently dropped (no error shown).
- Parse errors from PapaParse surface as an inline error banner in red.

## Persistence

On successful import, entities and claims are JSON-serialised and written to `localStorage` under the key `team-map-v1`. Demo mode ends. The app immediately re-renders with the new data.

## Data reset

Clearing `localStorage` (e.g. via browser dev tools) and reloading the page returns the app to demo mode.
