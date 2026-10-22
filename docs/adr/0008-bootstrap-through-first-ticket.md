# ADR-008: Bootstrap files land through ticket T-0001, not the initial commit

**Status:** Accepted (2026-10-22)

## Context

The spec planned for `main`'s initial commit to hold `README.md`, `.gitignore` and `CLAUDE.md`. By the time those files were ready, the initial commit (`1144a03`, `README.md` only) was already pushed to `main`.

Adding them to that commit would mean rewriting and force-pushing `main`. Committing them directly to `main` or `dev` would break the §14a rule that every change reaches `dev` through a ticket PR.

## Decision

`main` keeps its README-only initial commit. `.gitignore`, `CLAUDE.md`, the agent skills config (`docs/agents/`) and `docs/SPEC.md` land on `dev` through ticket `T-0001 RepoBootstrap`, as a normal PR.

Project scaffolding moves from the first ticket to `T-0002`.

The spec already reserves ADR-002 to ADR-007 for decisions not yet written down, so this ADR takes the next free number after them, 008. ADR-001 stays unused for now.

## Consequences

- No pushed history is rewritten, and every change follows the same ticket → branch → PR flow.
- `main` stays README-only until the final `dev` → `main` submission PR, which then brings in everything at once.
- Until `T-0001` merges, sessions on `dev` don't see `CLAUDE.md`, so the workflow rules aren't loaded automatically there.
