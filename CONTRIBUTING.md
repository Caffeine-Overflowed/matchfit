# Contributing

## Workflow: GitHub Flow

- `main` is always deployable. Direct commits and force-pushes to `main` are disabled — all changes go through pull requests.
- Code changes (`feat`, `fix`, `refactor`, `chore`, `ci`) start from an issue and the branch carries its number; `docs/` and `chore/` branches may go without.
- Short-lived branches off `main`, named `type/issue-slug`:
  - `feat/14-event-invites`
  - `fix/23-chat-flicker`
  - `chore/...`, `docs/...`, `ci/...`
- A branch lives days, not weeks. Merged branches are deleted automatically.

## Commits: Conventional Commits

```
feat(events): add capacity limit with waitlist
fix(chat): publish to redis after the message commits, not before
fix(match): guard mutual-like race with a unique constraint
```

- Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`
- Scopes: `backend`, `frontend`, `deploy`, `ci`, or a feature area (`chat`, `events`, `match`, `profile`, `auth`)
- English, imperative mood, lowercase after the colon
- Atomic commits: one logical change per commit

## Pull requests

- Every change goes through a PR. Reference the issue: `Closes #14`.
- Code PRs: self-merge allowed once CI is green.
- Schema changes ship with their Alembic migration in the same PR.
- Merge method: **rebase only** (linear history, atomic commits preserved). Squash and merge commits are disabled repo-wide.

## Releases

End of each milestone = tag + GitHub Release with notes (`v0.1.0`, `v0.2.0`, …).

## Attribution

Commits and PRs carry no AI attribution of any kind. All work is authored by project contributors only.
