import uuid

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.utils.observability.context import bind_request_id


class RequestIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        rid = request.headers.get("x-request-id", str(uuid.uuid4()))

        request.state.request_id = rid
        bind_request_id(rid)

        try:
            response: Response = await call_next(request)
        finally:
            bind_request_id(None)

        response.headers["x-request-id"] = request.state.request_id
        return response
