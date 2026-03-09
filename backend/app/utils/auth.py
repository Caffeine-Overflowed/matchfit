import secrets
from datetime import datetime, UTC, timedelta
from typing import Optional, Tuple

import bcrypt
from authlib.jose import jwt
from authlib.jose.errors import JoseError

from app.config import Config
from app.extensions.request_state_models import AuthContext


def hash_password(password: str) -> str:
    """Хеширует пароль с помощью bcrypt."""
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, password_hash: str) -> bool:
    """Проверяет пароль против хеша."""
    return bcrypt.checkpw(password.encode(), password_hash.encode())


def create_access_token(user_id: str, session_id: str) -> Tuple[str, int]:
    """Создаёт JWT access token."""
    now = datetime.now(UTC)
    expire_time = int((now + timedelta(seconds=Config.auth.access_ttl_sec)).timestamp())
    payload = {
        "iss": Config.auth.issuer,
        "sub": user_id,
        "sid": session_id,
        "iat": int(now.timestamp()),
        "exp": expire_time,
    }
    header = {"alg": "HS256"}
    return jwt.encode(header, payload, Config.auth.jwt_secret).decode(), expire_time


def create_refresh_token() -> Tuple[str, int]:
    """Создаёт случайный refresh token."""
    now = datetime.now(UTC)
    expire_time = int((now + timedelta(seconds=Config.auth.refresh_ttl_sec)).timestamp())
    return secrets.token_urlsafe(Config.auth.refresh_token_bytes_len), expire_time


def verify_access_token(token: str) -> Optional[AuthContext]:
    """
    Верифицирует access token и возвращает данные.

    Returns:
        AuthContext если токен валиден, None если невалиден.
    """
    try:
        claims = jwt.decode(token, Config.auth.jwt_secret)
        claims.validate()
        return AuthContext(
            user_id=claims["sub"],
            session_id=claims["sid"],
        )
    except JoseError:
        return None
