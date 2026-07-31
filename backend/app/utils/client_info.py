from typing import Optional

from starlette.requests import HTTPConnection

from app.extensions.request_state_models import ClientInfo


def _parse_locale(header: Optional[str]) -> Optional[str]:
    if not header:
        return None
    return header.split(",")[0].strip() or None


def _get_ip(conn: HTTPConnection) -> str:
    ip = conn.headers.get("cf-connecting-ip")
    if ip:
        return ip.strip()

    ip = conn.headers.get("true-client-ip")
    if ip:
        return ip.strip()

    xff = conn.headers.get("x-forwarded-for")
    if xff:
        return xff.split(",", 1)[0].strip()

    return conn.client.host if conn.client else "0.0.0.0"


def build_client_info(conn: HTTPConnection) -> ClientInfo:
    return ClientInfo(
        ip=_get_ip(conn),
        user_agent=conn.headers.get("user-agent"),
        locale=_parse_locale(conn.headers.get("accept-language")),
    )
