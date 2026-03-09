from pydantic import BaseModel, Field


class DBSettings(BaseModel):
    username: str = Field(...)
    password: str = Field(...)
    host: str = Field(...)
    port: int = Field(...)
    name: str = Field(...)
    pool_mode: str = Field(default="transaction")  # can be "transaction" or "session"
    echo: bool = Field(...)

    @property
    def async_dsn(self) -> str:
        return (
            f"postgresql+asyncpg://{self.username}:{self.password}"
            f"@{self.host}:{self.port}/{self.name}"
        )

    @property
    def sync_dsn(self) -> str:
        return (
            f"postgresql+psycopg2://{self.username}:{self.password}"
            f"@{self.host}:{self.port}/{self.name}"
        )
