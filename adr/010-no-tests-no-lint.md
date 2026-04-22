# ADR-010: No test framework, no linter (V1)

**Status:** Accepted

## Context

V1 is a concept-validation prototype. The codebase is small, type-checked by TypeScript strict mode, and single-maintainer. Adding Vitest + ESLint + Prettier right now would be ceremony without payoff.

## Decision

No test runner configured. No ESLint, no Prettier. Quality gate is `tsc --noEmit` (run as part of `npm run build`). `package.json` has only `dev`, `build`, `preview` scripts.

## Consequences

- Faster iteration during the prototype phase.
- Type errors still block builds via the `tsc` pre-step.
- Regressions in runtime behaviour (e.g., CSV parsing edge cases) are caught only by manual testing.
- Revisit when either: the app is shared with other maintainers, or the codebase exceeds ~2000 LOC.
