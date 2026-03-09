import re

import pycountry

from app.config import Config
from app.extensions.errors.validation import (
    InvalidEmailError, 
    PasswordTooShortError,
    BioTooLongError,
    InvalidLanguageCodeError,
    TooManyLanguagesError,
)

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
BIO_MAX_LENGTH = 500
MAX_LANGUAGES = 5


def validate_email(email: str) -> str:
    """Валидирует и нормализует email."""
    email = email.lower().strip()
    if not EMAIL_REGEX.match(email):
        raise InvalidEmailError()
    return email


def validate_password(password: str) -> None:
    """Валидирует пароль по минимальной длине."""
    if len(password) < Config.auth.password_min_length:
        raise PasswordTooShortError(min_length=Config.auth.password_min_length)


def validate_bio(bio: str | None) -> str:
    """Валидирует bio по максимальной длине. Возвращает пустую строку если None."""
    if bio is None:
        return ""
    bio = bio.strip()
    if len(bio) > BIO_MAX_LENGTH:
        raise BioTooLongError(max_length=BIO_MAX_LENGTH, actual_length=len(bio))
    return bio


def validate_languages(codes: list[str]) -> list[str]:
    """Валидирует коды языков по ISO 639-1. Максимум 5 языков."""
    if len(codes) > MAX_LANGUAGES:
        raise TooManyLanguagesError(max_count=MAX_LANGUAGES, actual_count=len(codes))
    
    validated = []
    for code in codes:
        code = code.lower().strip()
        if not pycountry.languages.get(alpha_2=code):
            raise InvalidLanguageCodeError(code=code)
        validated.append(code)
    return validated
