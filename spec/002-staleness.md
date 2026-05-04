# SPEC-002: Staleness indicator

**Status:** Removed

## Overview

Previously, a colored dot next to a claim's subject communicated how recently that fact was confirmed, computed from the `verified` date on each claim.

## Why removed

The `verified` date is identical across all claims (set at import time from the source file), making the staleness signal meaningless — every dot would show the same age. The feature was removed entirely.

## What was removed

- `StaleTag` component (`src/components/StaleTag.tsx`)
- `utils/stale.ts` (`staleDays`, `staleLevel`, `staleLabel`)
- `StaleLevel` type in `types.ts`
- `.stale-dot` CSS block in `styles.css`
- StaleTag render sites in `PersonItem`, `ProjectItem`, `RepoItem`, `OrgChart`

## Data model

The `verified` field remains on the `Claim` type and is still parsed from `team.json` — it is part of the data schema but no longer displayed.
