# ADR-014: Static, read-only viewer — no live data sources

**Status:** Accepted

## Context

The team map is updated infrequently (roughly monthly) by one or two maintainers who export CSV files from a private repo and import them through the UI. The app's primary audience is engineers who need a quick answer to "who works on X?" — they do not need real-time accuracy, only a low-friction way to read the current snapshot.

## Decision

The app is a **static, read-only viewer**. It:

- Never modifies org data — there are no write operations beyond storing the user's last import in `localStorage`.
- Has no connection to live external systems (HR platforms, Slack, Jira, GitHub, or any API). All displayed data comes exclusively from the last CSV import.
- Runs entirely in the browser with no backend server. The deployed artifact is a plain HTML/JS/CSS bundle.
- Uses `localStorage` as a working copy only; the canonical source of truth is the CSV files in a private Git repo.

## Consequences

- **Staleness is expected and visible.** Facts become stale between import cycles. The staleness indicator (colored dot per claim, SPEC-002) makes this explicit rather than hiding it.
- **No infrastructure to maintain.** No servers, no auth, no databases, no webhooks.
- **No sync across devices.** Each browser holds its own copy. Share updated CSVs to keep multiple users in sync.
- **Data never leaves the machine.** Imported org data stays in the browser's `localStorage`. This is a deliberate privacy property — no account, no cloud storage.
- **Integration is manual by design.** Connecting to live HR/PM systems would require auth, ongoing maintenance, and a backend — disproportionate for a monthly-update cadence and outside the project's scope.
