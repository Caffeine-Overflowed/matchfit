import re
from datetime import date

import pycountry
from strawberry.file_uploads import Upload

from app.config import Config
from app.extensions.errors.validation import (
    InvalidEmailError,
    PasswordTooShortError,
    BioTooLongError,
    InvalidLanguageCodeError,
    TooManyLanguagesError,
    InvalidImageTypeError,
    ImageTooLargeError,
    InvalidBirthDateError,
)

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
BIO_MAX_LENGTH = 500
MAX_LANGUAGES = 5
ALLOWED_IMAGE_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB
MIN_BIRTH_YEAR = 1900
MIN_AGE_YEARS = 13


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


async def validate_image_upload(upload: Upload) -> bytes:
    """Валидирует загружаемое изображение (расширение, content-type, размер).

    Возвращает содержимое файла. Общий хелпер для аватаров и картинок событий.
    """
    filename = getattr(upload, "filename", None) or ""
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    # слэши в имени файла могут породить вложенные ключи в MinIO
    if "/" in filename or "\\" in filename or ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise InvalidImageTypeError(extension=ext)
    content_type = getattr(upload, "content_type", None) or ""
    if not content_type.startswith("image/"):
        raise InvalidImageTypeError(content_type=content_type)
    content = await upload.read()
    if len(content) > MAX_IMAGE_SIZE_BYTES:
        raise ImageTooLargeError(max_bytes=MAX_IMAGE_SIZE_BYTES, actual_bytes=len(content))
    return content


def validate_birth_date(birth_year: int, birth_month: int) -> date:
    """Валидирует год/месяц рождения и возвращает дату (15-е число месяца)."""
    max_year = date.today().year - MIN_AGE_YEARS  # минимальный возраст
    if not (1 <= birth_month <= 12) or not (MIN_BIRTH_YEAR <= birth_year <= max_year):
        raise InvalidBirthDateError(year=birth_year, month=birth_month)
    return date(year=birth_year, month=birth_month, day=15)
