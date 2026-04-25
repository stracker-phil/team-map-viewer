# SPEC-009: Person detail

**Status:** Established

## Overview

The person detail page (`#/person/:id`) shows a person's squad memberships, project contributions, and their position in the reporting hierarchy — both upward (who they report to) and downward (who reports to them).

## Header

- Large avatar, eyebrow "PERSON", name as title, specific role title as italic subtitle. Role title is taken from the person's `role` claim (`object` field) if one exists; otherwise falls back to `entity.meta`.

## META section

Shows squad memberships and project contributions.

- **Squads**: all `member-of` claims where the person is subject. Each squad rendered as `EntityLink · staleness dot`. Multiple squads comma-separated inline.
- **Contributes to**: all `works-on` claims where the person is subject. Each project rendered as `EntityLink · role in parens (e.g. "(dev)") · staleness dot`. **One project per line** (not comma-separated).
- If neither squads nor projects are recorded, shows "No assignments recorded yet."

## PEOPLE section

Shows both directions of the reporting line.

### Reports to (upward)

- Derived from `reports-to` claims where the person is the **subject**.
- Grouped by `detail` value. Known types display with full labels:
  - `EM` → "Engineering Manager (EM)"
  - `SL` → "Squad Lead (SL)"
  - Other values display as-is.
- Known types (EM, SL) appear first; remaining types follow in insertion order.
- Each manager: avatar · name link · staleness dot, one per line.

### Manages (downward)

- Derived from `reports-to` claims where the person is the **object** — i.e. other people who report to this person.
- Grouped by `detail` value. Known types display as:
  - `EM` → "Manages (EM)"
  - `SL` → "Manages (SL)"
  - Other values display as-is.
- Within each group, reports are sorted alphabetically by name.
- Each report: avatar · name link · staleness dot, one per line.

If neither upward nor downward reporting lines are recorded, shows "No reporting line recorded yet."

## Layout

Two-column: main content left, `LinksSidebar` right (30%). Collapses to single column below 768 px.
