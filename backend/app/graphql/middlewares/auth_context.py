from typing import Optional

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from app.extensions.request_state_models import AuthContext
from app.utils.auth import verify_access_token
from app.utils.observability import get_logger

log = get_logger()


def _extract_bearer(request: Request) -> Optional[str]:
    value = request.headers.get("authorization")
    if not value:
        return None
    scheme, _, token = value.partition(" ")
    if scheme.lower() != "bearer" or not token:
        return None
    return token.strip()


class AuthContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request.state.auth_context = None

        token = _extract_bearer(request)
        if not token:
            log.debug("auth.token.missing")
            return await call_next(request)

        payload = verify_access_token(token)
        if payload:
            request.state.auth_context = AuthContext(
                user_id=payload.user_id,
                session_id=payload.session_id,
            )
            log.info(
                "auth.token.verified",
                user_id=payload.user_id,
                session_id=payload.session_id,
            )
        else:
            log.warning("auth.token.verify_failed")

        return await call_next(request)
