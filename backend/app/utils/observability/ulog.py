# core/observability.py
import inspect
import logging
import os
from logging.config import dictConfig
from typing import Optional

import structlog
from structlog.stdlib import BoundLogger

_initialized = False
_SERVICE = None


class StaticFieldsFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        record.service = _SERVICE or "app"
        return True


class LevelGTE(logging.Filter):
    def __init__(self, level: int) -> None:
        super().__init__()
        self.level = level

    def filter(self, record: logging.LogRecord) -> bool:
        return record.levelno >= self.level


def _drop_color_message(_, __, event_dict: dict):
    event_dict.pop("color_message", None)
    return event_dict


def _drop_request_id_for_uvicorn_access(_, __, event_dict: dict):
    if event_dict.get("logger") == "uvicorn.access":
        event_dict.pop("request_id", None)
    return event_dict


def setup_logging(level: str = "INFO", dev_pretty_errors: bool = True):
    global _initialized
    if _initialized:
        return

    dictConfig({
        "version": 1,
        "disable_existing_loggers": False,

        "formatters": {
            "json": {
                "()": "structlog.stdlib.ProcessorFormatter",
                "processor": structlog.processors.JSONRenderer(),
                "foreign_pre_chain": [
                    structlog.contextvars.merge_contextvars,
                    structlog.processors.TimeStamper(fmt="iso"),
                    structlog.stdlib.add_log_level,
                    structlog.stdlib.add_logger_name,
                    _drop_request_id_for_uvicorn_access,
                    structlog.stdlib.ExtraAdder(),
                    structlog.processors.EventRenamer("message"),
                    _drop_color_message,
                ],
            },
            # читаемый многострочный вид для ошибок в деве
            "plain": {
                "format": "%(asctime)s %(levelname)s %(name)s: %(message)s",
            },
        },

        "filters": {
            "static_fields": {"()": StaticFieldsFilter},
            "errors_only": {"()": LevelGTE, "level": logging.ERROR},
        },

        "handlers": {
            # основной JSON поток
            "json_console": {
                "class": "logging.StreamHandler",
                "formatter": "json",
                "filters": ["static_fields"],
            },
            # дублируем только ошибки читаемо (dev)
            "pretty_errors": {
                "class": "logging.StreamHandler",
                "formatter": "plain",
                "filters": ["errors_only"],
            } if dev_pretty_errors else {
                "class": "logging.NullHandler"  # в проде не нужен
            },
        },

        # root пишет JSON; ошибки дополнительно пройдут через pretty_errors
        "root": {
            "handlers": ["json_console", "pretty_errors"],
            "level": level,
        },

        "loggers": {
            # uvicorn оставляем сквозным — его ошибки тоже пойдут через pretty_errors
            "uvicorn": {"level": level, "propagate": True},
            "uvicorn.error": {"level": level, "propagate": True},
            "uvicorn.access": {"level": level, "propagate": True},
            "sqlalchemy.engine": {"level": "WARNING"},
        },
    })

    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.stdlib.add_log_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.ExtraAdder(),
            structlog.processors.EventRenamer("message"),
            structlog.stdlib.ProcessorFormatter.wrap_for_formatter,  # отдаём stdlib’у
        ],
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    _initialized = True


def set_app_identity(*, name: Optional[str] = None) -> str:
    global _SERVICE, _APPNAME
    resolved = os.getenv("SERVICE_NAME") or (name or "app")
    _SERVICE = resolved
    structlog.contextvars.bind_contextvars(service=resolved)
    return resolved


def get_logger() -> BoundLogger:
    module = inspect.currentframe().f_back.f_globals.get("__name__", "app")
    return structlog.get_logger(module)
