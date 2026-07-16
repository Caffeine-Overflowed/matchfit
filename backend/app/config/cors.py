from pydantic import BaseModel, Field


class CorsSettings(BaseModel):
    # список origin через запятую; "*" — только для dev
    origins: str = Field(default="*")

    @property
    def origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.origins.split(",") if origin.strip()]
