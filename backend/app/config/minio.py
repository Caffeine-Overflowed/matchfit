from pydantic import BaseModel, Field

class MinioSettings(BaseModel):
    endpoint: str = Field(...)
    access_key: str = Field(...)
    secret_key: str = Field(...)
    bucket_name: str = Field(...)
    secure: bool = Field(...)