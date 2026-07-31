from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from app.utils.auth import extract_bearer, verify_access_token
from app.utils.observability import get_logger

log = get_logger()


class AuthContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request.state.auth_context = None

        token = extract_bearer(request.headers.get("authorization"))
        if not token:
            log.debug("auth.token.missing")
            return await call_next(request)

        auth_context = verify_access_token(token)
        if auth_context:
            request.state.auth_context = auth_context
            log.info(
                "auth.token.verified",
                user_id=auth_context.user_id,
                session_id=auth_context.session_id,
            )
        else:
            log.warning("auth.token.verify_failed")

        return await call_next(request)
