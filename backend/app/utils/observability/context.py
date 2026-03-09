import structlog
from contextvars import ContextVar

_request_id = ContextVar("request_id", default=None)

def bind_request_id(rid: str | None):
    _request_id.set(rid)
    structlog.contextvars.bind_contextvars(request_id=rid)
