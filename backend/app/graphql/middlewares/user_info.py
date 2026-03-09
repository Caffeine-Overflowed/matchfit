from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from app.extensions.request_state_models import ClientInfo


def _parse_locale(header: str | None) -> str | None:
    if not header:
        return None
    return header.split(",")[0].strip() or None


def _get_ip(request: Request) -> str:
    # Headers у Starlette case-insensitive
    ip = request.headers.get("cf-connecting-ip")
    if ip:
        return ip.strip()

    ip = request.headers.get("true-client-ip")  # Cloudflare Enterprise
    if ip:
        return ip.strip()

    xff = request.headers.get("x-forwarded-for")
    if xff:
        return xff.split(",", 1)[0].strip()

    return request.client.host if request.client else "0.0.0.0"


class UserInfoMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        ip = _get_ip(request)
        ua = request.headers.get("user-agent")
        locale = _parse_locale(request.headers.get("accept-language"))

        request.state.client_info = ClientInfo(ip=ip, user_agent=ua, locale=locale)
        return await call_next(request)
