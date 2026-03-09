from app.extensions.errors.base import BaseDomainError


class InternalServerError(BaseDomainError):
    """Внутренняя ошибка сервера."""
    CODE = "internal_server_error"