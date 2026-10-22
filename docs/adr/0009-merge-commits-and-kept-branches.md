# ADR-009: Merge PRs with merge commits and keep every ticket branch

**Status:** Accepted (2026-10-22)

## Context

The assignment brief says the work is submitted as a PR for the interviewer to review, and that "the PR's branch should be cloneable as well". Reviewers should be able to see each ticket's branch and its small Conventional Commits, not just the final result on `dev`.

GitHub allows three merge methods. Squash merges collapse a ticket's commits into one, and rebase merges rewrite them onto `dev`. Either way, the commits on `dev` no longer match the ones on the ticket branch. GitHub can also delete the head branch automatically after a merge.

## Decision

- PRs merge with a **merge commit** (`--no-ff`) only. Squash and rebase merges are disabled in the GitHub repo settings.
- Ticket branches are **kept** after merge, both locally and on `origin`. Automatic branch deletion on merge is off.

## Consequences

- `dev` and `main` show one merge commit per ticket, with the ticket's own commits beneath it. `git log --first-parent dev` reads as one line per ticket.
- Every PR's branch stays cloneable, as the brief requires.
- The branch list grows by one per ticket. That's acceptable at this project's size.
- The repo is private on a free plan, so GitHub can't enforce these rules with branch protection. They're upheld by the repo settings above, this spec and `CLAUDE.md`.
