# SPEC-002: Staleness indicator

**Status:** Established

## Overview

Every claim carries a `verified` date. A colored dot next to a claim's subject communicates how recently that fact was confirmed.

## Thresholds

Age is computed as calendar days between `verified` and today.

| Age           | Level   | Dot color              |
|---------------|---------|------------------------|
| < 30 days     | fresh   | muted teal (30% opacity) |
| 30 – 59 days  | warn    | amber (`#d97706`)      |
| 60 – 89 days  | old     | orange (`#ea580c`)     |
| ≥ 90 days     | stale   | red (`#dc2626`)        |
| empty/invalid | fresh   | muted teal             |

A missing or unparseable `verified` date is treated as fresh (no penalty).

## Placement

The `StaleTag` dot appears:
- Next to each person in the squad overview card People tab (member-of claim)
- Next to each person's name in squad detail people column (member-of claim)
- Next to each project in squad detail projects column (owned-by claim)
- Next to managers and direct reports in person detail (reports-to claim)
- Next to each squad and project in person detail (member-of, works-on claims)
- In the org chart nodes on project detail (works-on claims)

The dot is always the first visual element inside a `.claim-item`, or rendered inline after the entity name.
