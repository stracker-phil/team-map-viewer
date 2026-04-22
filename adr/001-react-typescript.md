# ADR-001: React 18 + TypeScript for the UI

**Status:** Accepted

## Context

The project needs an interactive SPA that renders interlinked views over a small dataset (~300 rows). It must be maintainable by a single developer and approachable for AI-assisted edits.

## Decision

Build the UI with React 18.3 and TypeScript 5.5. `tsconfig.json` enables `strict: true`, `jsx: "react-jsx"`, and `moduleResolution: "bundler"`. Function components only; state via hooks (`useState`, `useEffect`, `useContext`).

## Consequences

- Type safety across the data model (`Entity`, `Claim`, `RelationType`) catches schema drift at compile time.
- React has the widest ecosystem and training data — favourable for AI assistance and future contributors.
- No class components; hooks-only style keeps files compact.
- Strict TS means unused locals/params are allowed (not enabled), but `noImplicitAny` etc. still apply.
