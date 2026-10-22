# ADR-010: Develop all behaviour test-first

**Status:** Accepted (2026-10-22)

## Context

The spec listed TDD seams (§13) and asked for `/tdd` at those seams, but did not say that development as a whole is test-driven. The assignment brief asks the author to explain why the code is written the way it is, and to handle error, loading, localization and the senior requirements. Those are behaviours that tests can pin down before the code exists.

## Decision

All behaviour is developed test-first with `/tdd`:

- Red before green: one failing test, then the minimum code to pass it.
- Vertical slices: one seam, one test, one implementation per cycle. No writing all tests up front.
- Tests go only at agreed seams (§13) and observe behaviour through public interfaces. A new seam is confirmed with the author first and added to §13 in the same PR.
- Bugs start with a failing test that reproduces them.
- Refactoring happens at review, outside the red → green loop.
- Each commit holds a slice's test and implementation together, so every commit passes `tsc`, lint and tests.

Exceptions: project scaffolding and config (`T-0003`), and pure styling with no behaviour, which is checked against Figma. Each PR states which changes were not test-driven and why.

## Consequences

- Every behaviour in the spec has a test that was written before its code, so tests describe behaviour rather than mirror the implementation.
- The red step isn't visible in git history, because commits stay green. The evidence is the tests themselves and the PR's "Tests added" section.
- Work on a seam not listed in §13 pauses until the author confirms it.
