# ADR-009: Merge PRs with merge commits and keep every feature branch

**Status:** Accepted (2026-10-22). Amended in T-0003: work moved from one branch per ticket to one branch per release (`feats/vX.Y.Z`, SPEC §14); the decision below applies to those branches.

## Context

The assignment brief says the work is submitted as a PR for the interviewer to review, and that "the PR's branch should be cloneable as well". Reviewers should be able to see each branch and its small Conventional Commits, not just the final result on `dev`.

GitHub allows three merge methods. Squash merges collapse a branch's commits into one, and rebase merges rewrite them onto the target. Either way, the commits on `dev` no longer match the ones on the branch. GitHub can also delete the head branch automatically after a merge.

## Decision

- PRs merge with a **merge commit** (`--no-ff`) only. Squash and rebase merges are disabled in the GitHub repo settings.
- Feature branches are **kept** after merge, both locally and on `origin`: the release branches `feats/v1.0.0` and `feats/v1.1.0`, and the earlier ticket branches `feats/T-0001-RepoSetup` and `feats/T-0002-SpecRefinement`. Automatic branch deletion on merge is off.

## Consequences

- `dev` shows one merge commit per release branch (and per early ticket), with that branch's ticket commits beneath it. `main` shows one "Release vX.Y.Z" merge commit per release, so `git log --first-parent main` reads as a list of releases.
- Every PR's branch stays cloneable, as the brief requires.
- The branch list stays short: one branch per release.
- The repo is private on a free plan, so GitHub can't enforce these rules with branch protection. They're upheld by the repo settings above, this spec and `CLAUDE.md`.
