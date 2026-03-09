from app.extensions.errors.base import BaseDomainError


class UnauthorizedError(BaseDomainError):
    """Ошибка неавторизованного доступа."""

    CODE = "unauthorized"


class InvalidCredentialsError(BaseDomainError):
    """Неверный email или пароль."""

    CODE = "invalid_credentials"


class EmailAlreadyExistsError(BaseDomainError):
    """Пользователь с таким email уже существует."""

    CODE = "email_already_exists"


class InvalidRefreshTokenError(BaseDomainError):
    """Невалидный или истёкший refresh token."""

    CODE = "invalid_refresh_token"


class GoogleAuthError(BaseDomainError):
    """Ошибка авторизации через Google."""

    CODE = "google_auth_error"


class InvalidOAuthStateError(BaseDomainError):
    """Невалидный или истёкший OAuth state."""

    CODE = "invalid_oauth_state"