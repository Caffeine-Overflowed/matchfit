from pydantic_settings import BaseSettings, SettingsConfigDict

from app.config.app import AppSettings
from app.config.auth import AuthSettings
from app.config.db import DBSettings
from app.config.google import GoogleSettings
from app.config.minio import MinioSettings
from app.config.redis import RedisSettings


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_nested_delimiter="__",
        case_sensitive=False,
        extra="forbid",
        validate_default=True,
    )

    app: AppSettings
    db: DBSettings
    auth: AuthSettings
    redis: RedisSettings
    google: GoogleSettings
    minio: MinioSettings
