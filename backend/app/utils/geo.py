"""Утилиты для работы с геолокацией (PostGIS)."""

from geoalchemy2 import WKBElement
from geoalchemy2.shape import to_shape
from shapely.geometry import Point


def make_point(lat: float, lon: float) -> str:
    """Создаёт WKT POINT из lat/lon для вставки в БД."""
    # PostGIS: POINT(lon lat) — долгота первая!
    return f"SRID=4326;POINT({lon} {lat})"


def extract_coords(location: WKBElement | None) -> tuple[float, float] | None:
    """Извлекает (lat, lon) из Geography колонки."""
    if location is None:
        return None
    point: Point = to_shape(location)
    return (point.y, point.x)  # lat, lon
