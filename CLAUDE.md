# MatchFit — project rules

Sports companion matching platform: swipe-match people by sport and location, chat, and organize events. GraphQL API + Next.js web client.

## Languages

- Communication with Claude: Russian.
- Code, commits, identifiers, route segments, URLs: English — no Serbian/Russian naming anywhere.
- UI copy and user-facing strings live in the frontend, not hardcoded in backend responses.

## GitHub

- Account: **Dimitrymas**. Organization: **Caffeine-Overflowed**. Repo is public.
- Roadmap via issues + milestones.

## Git workflow (see CONTRIBUTING.md)

- GitHub Flow: `main` protected, everything via PR (`Closes #N`), branches `type/issue-slug`, branch deleted after merge.
- Conventional Commits, atomic: `feat|fix|docs|chore|refactor|test|ci(scope): imperative lowercase`.
- Scopes: `backend`, `frontend`, `deploy`, `ci`, or a feature area (`chat`, `events`, `match`, `profile`, `auth`).
- Rebase merge only — squash and merge commits are disabled; atomic commits must reach `main`.
- Code PRs: self-merge on green CI.
- Commits and PRs carry no AI attribution of any kind.

## Stack and architecture

- Backend (`backend/`): Python 3.13, FastAPI + Strawberry GraphQL, SQLAlchemy 2 async (asyncpg), Alembic. `uv` for deps.
- Auth: Authlib Google OAuth + bcrypt password login. JWT access/refresh tokens.
- Data: Postgres + PostGIS (GeoAlchemy2/Shapely) for geo queries; Redis for pub/sub and presence; MinIO (`miniopy-async`) for images.
- Frontend (`frontend/`): Next.js 16 App Router, React 19, TypeScript. Apollo Client 4 + `graphql-ws` subscriptions + `apollo-upload-client`. Zustand scoped to runtime state. Tailwind. `graphql-codegen` for typed operations.
- Deploy (`deploy/`): Helm chart, k3s. One release == one independent instance (own namespace, DB, MinIO, hostname). Images in `registry.coverflow.net`. Managed separately from feature work.
- Local dev: `docker-compose.yml` (Postgres, Redis, MinIO + bucket-init).

## Code and docs — no noise

- No comments in code. Names carry intent; PRs and commit messages carry the "why".
- Docs: facts, decisions, instructions only.

## Conventions

- Backend: services in `app/services/`, GraphQL in `app/graphql/`, models in `app/models/`, shared helpers in `app/utils/`, typed errors in `app/extensions/errors/`.
- Redis publish happens after the DB transaction commits, never inside it.
- All image links are built through `MinioService.form_link` (returns `None` when there is no object).
- New DB schema changes ship with an Alembic migration in the same PR.
- Frontend data hooks live in `src/features/<area>/hooks/`; Apollo links in `src/shared/api/apollo/`.
