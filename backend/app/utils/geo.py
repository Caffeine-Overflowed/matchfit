"""Утилиты для работы с геолокацией (PostGIS)."""

import math

from geoalchemy2 import WKBElement
from geoalchemy2.shape import to_shape
from shapely.geometry import Point

from app.extensions.errors.validation import InvalidCoordinatesError


def make_point(lat: float, lon: float) -> str:
    """Создаёт WKT POINT из lat/lon для вставки в БД."""
    # PostGIS отклоняет такие координаты только на flush -> необработанный 500
    if not (math.isfinite(lat) and math.isfinite(lon) and -90 <= lat <= 90 and -180 <= lon <= 180):
        raise InvalidCoordinatesError(lat=lat, lon=lon)
    # PostGIS: POINT(lon lat) — долгота первая!
    return f"SRID=4326;POINT({lon} {lat})"


def extract_coords(location: WKBElement | None) -> tuple[float, float] | None:
    """Извлекает (lat, lon) из Geography колонки."""
    if location is None:
        return None
    point: Point = to_shape(location)
    return (point.y, point.x)  # lat, lon
