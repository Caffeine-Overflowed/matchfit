from typing import Literal

from pydantic import BaseModel, Field

LogLevel = Literal["CRITICAL", "ERROR", "WARNING", "INFO", "DEBUG", "NOTSET"]
EnvName = Literal["dev", "test", "stage", "prod"]


class AppSettings(BaseModel):
    env: EnvName = Field(default="dev")
    log_level: LogLevel = Field(...)

    @property
    def IS_DEV(self) -> bool:
        return self.env in ("dev", "test")
