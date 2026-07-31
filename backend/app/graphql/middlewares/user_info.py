from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from app.utils.client_info import build_client_info


class UserInfoMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request.state.client_info = build_client_info(request)
        return await call_next(request)
