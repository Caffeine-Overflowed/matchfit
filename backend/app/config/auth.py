from pydantic import BaseModel, Field


class AuthSettings(BaseModel):
    jwt_secret: str = Field(..., min_length=32)
    access_ttl_sec: int = Field(..., gt=0)
    refresh_ttl_sec: int = Field(..., gt=0)
    issuer: str = Field(..., min_length=1)
    refresh_token_bytes_len: int = Field(..., gt=16)
    password_min_length: int = Field(..., gt=5)
