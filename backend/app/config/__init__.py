from app.config.app import AppSettings
from app.config.auth import AuthSettings
from app.config.base import Settings
from app.config.db import DBSettings
from app.config.google import GoogleSettings
from app.config.loaders import load_settings

Config = load_settings()

__all__ = [
    "Settings",
    "Config",
    "AppSettings",
    "AuthSettings",
    "DBSettings",
    "GoogleSettings",
]
