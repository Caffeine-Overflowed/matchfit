# core/settings/loaders.py
import os
import sys
from functools import lru_cache

from pydantic import ValidationError

from app.config.base import Settings


@lru_cache(maxsize=1)
def load_settings() -> Settings:
    try:
        return Settings()  # noqa:
    except ValidationError as e:
        lines = []
        for err in e.errors():
            loc = ".".join(map(str, err["loc"]))
            msg = err["msg"]
            lines.append(f"  • {loc}: {msg}")
        sys.stderr.write(
            "\n❌ Environment configuration error\n"
            "Missing/invalid settings:\n" + "\n".join(lines) +
            "\n\nFix your .env or environment variables.\n"
        )
        os._exit(1)  # мгновенный выход без трейсбека
