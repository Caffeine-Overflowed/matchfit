from pydantic import BaseModel, Field


class RedisSettings(BaseModel):
    host: str = Field(...)
    port: int = Field(...)
