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

## Versioning

[SemVer](https://semver.org): `MAJOR.MINOR.PATCH`. Pre-1.0 (`0.MINOR.PATCH`): new features bump MINOR, fix-only releases bump PATCH, breaking changes are allowed. `1.0.0` is the first stable public release.

## Milestones

A milestone maps to a target version (`v0.2` → `v0.2.0`). Every planned issue is filed into its milestone — that is where work is "attached to the future version". The tag does not exist yet; the milestone is its placeholder until release.

## Releases

Cut when a milestone is 100% closed on `main`:

1. Annotated tag (never lightweight): `git tag -a v0.2.0 -m "v0.2.0 — <theme>"`, then `git push origin v0.2.0`.
2. `gh release create v0.2.0 --target main --generate-notes` — notes are built from PRs merged since the last tag (`feat` → Features, `fix` → Fixes).
3. Close the milestone; open the next one.

Hotfixes after a release ship as a PATCH bump (`v0.2.1`, fix-only). Tags are immutable — GitOps promotes and rolls back to them.

## Attribution

Commits and PRs carry no AI attribution of any kind. All work is authored by project contributors only.
