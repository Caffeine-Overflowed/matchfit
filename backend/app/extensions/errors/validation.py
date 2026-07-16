from app.extensions.errors.base import BaseDomainError


class InvalidInputDataError(BaseDomainError):
    """Ошибка: некорректные входные данные."""

    CODE = "invalid_input_data"


class InvalidEmailError(BaseDomainError):
    """Некорректный формат email."""

    CODE = "invalid_email"


class PasswordTooShortError(BaseDomainError):
    """Пароль слишком короткий."""

    CODE = "password_too_short"


class BioTooLongError(BaseDomainError):
    """Bio превышает максимальную длину."""

    CODE = "bio_too_long"


class InvalidLanguageCodeError(BaseDomainError):
    """Недопустимый код языка ISO 639-1."""

    CODE = "invalid_language_code"


class TooManyLanguagesError(BaseDomainError):
    """Превышено максимальное количество языков."""

    CODE = "too_many_languages"


class InvalidImageTypeError(BaseDomainError):
    """Недопустимый тип/расширение загружаемого изображения."""

    CODE = "invalid_image_type"


class ImageTooLargeError(BaseDomainError):
    """Загружаемое изображение превышает максимальный размер."""

    CODE = "image_too_large"


class InvalidBirthDateError(BaseDomainError):
    """Некорректные год/месяц рождения."""

    CODE = "invalid_birth_date"


class InvalidCoordinatesError(BaseDomainError):
    """Координаты вне допустимого диапазона."""

    CODE = "invalid_coordinates"
