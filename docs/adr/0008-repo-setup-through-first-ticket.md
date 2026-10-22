# ADR-008: Repo setup files land through ticket T-0001, not the initial commit

**Status:** Accepted (2026-10-22)

## Context

The spec planned for `main`'s initial commit to hold `README.md`, `.gitignore` and `CLAUDE.md`. By the time those files were ready, the initial commit (`1144a03`, `README.md` only) was already pushed to `main`.

Adding them to that commit would mean rewriting and force-pushing `main`. Committing them directly to `main` or `dev` would break the §14a rule that every change reaches `dev` through a ticket PR.

The spec is also still a draft. It needs a full pass against the PRD, the assignment brief and Figma before any app code is written.

## Decision

`main` keeps its README-only initial commit. The opening tickets are fixed:

1. `T-0001 RepoSetup`: `.gitignore`, `CLAUDE.md`, the agent skills config (`docs/agents/`), the PR template and `docs/SPEC.md`, as a normal PR into `dev`.
2. `T-0002 SpecRefinement`: refine the spec with `/grill-with-docs`, recording decisions as ADRs.
3. `T-0003`: project scaffolding, which the spec originally placed first.

The spec already reserves ADR-002 to ADR-007 for decisions not yet written down, so this ADR takes the next free number after them, 008. ADR-001 stays unused for now.

## Consequences

- No pushed history is rewritten, and every change follows the same ticket → branch → PR flow.
- `main` stays README-only until the final `dev` → `main` submission PR, which then brings in everything at once.
- No app code is written until the spec has been refined.
- Until `T-0001` merges, sessions on `dev` don't see `CLAUDE.md` or `.gitignore`, so the workflow rules aren't loaded and `.private/` isn't ignored there.
