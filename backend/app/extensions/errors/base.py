from abc import ABC
from typing import ClassVar


class BaseDomainError(Exception, ABC):
    """Base class for all domain-specific errors."""

    CODE: ClassVar[str]  # Обязательный атрибут

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        if not hasattr(cls, 'CODE') or cls.CODE is None:
            raise TypeError(f"Class {cls.__name__} must define CODE attribute")

    def __init__(self, **context):
        self.context = context
        message = self.CODE.format(**context) if context else self.CODE
        super().__init__(message)
