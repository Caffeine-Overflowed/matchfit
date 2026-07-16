from pydantic import BaseModel, Field


class RedisSettings(BaseModel):
    host: str = Field(...)
    port: int = Field(...)
    password: str | None = Field(default=None)
