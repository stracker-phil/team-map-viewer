# SPEC-003: Demo mode

**Status:** Established

## Overview

When no real data has been imported, the app loads fictional sample data into memory so first-time visitors see a working interface.

## Trigger

Demo mode activates when `localStorage` contains no entry for the key `team-map-v1` at app startup.

## Behavior

- Sample entities and claims from `src/sampleData.ts` are parsed and loaded into memory only — they are never written to `localStorage`.
- `DataContext` exposes `isDemo: true` while sample data is active.
- A dismissible banner appears at the top of every page:
  > "Showing sample data — import your own CSV files to get started"
  The "import your own CSV files" text is a link that opens the import modal.
- All views (squads, projects, people, search) work normally against sample data.
- When the user imports real data, it is saved to `localStorage` and demo mode ends permanently. The banner disappears. Refreshing the page loads the real data.

## Sample data content

Sample data uses entirely fictional names and identifiers. No real company names, email addresses, or employee IDs appear.
