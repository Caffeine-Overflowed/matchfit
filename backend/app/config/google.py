from pydantic import BaseModel, Field


class GoogleSettings(BaseModel):
    client_id: str = Field(...)
    client_secret: str = Field(...)
    redirect_uri: str = Field(...)
