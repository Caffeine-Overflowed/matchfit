FROM ghcr.io/astral-sh/uv:python3.13-bookworm-slim AS base

WORKDIR /app

COPY pyproject.toml uv.lock* README.md ./
COPY alembic.ini ./alembic.ini
COPY alembic ./alembic

RUN uv sync --frozen --group migration && uv pip list

COPY app ./app
COPY scripts ./scripts

EXPOSE 8000

# Default command
CMD ["uv", "run", "server"]
