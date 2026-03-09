from typing import Optional
import httpx
from app.utils.observability import get_logger
from app.services.redis_service import RedisService

log = get_logger()

class GeoService:
    _client: Optional[httpx.AsyncClient] = None
    _NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse"
    _USER_AGENT = "HackathonApi/1.0"

    @classmethod
    async def init(cls):
        """Инициализация HTTP клиента."""
        if cls._client is None:
            cls._client = httpx.AsyncClient(timeout=10.0)
            log.debug("geo_service.initialized")

    @classmethod
    async def close(cls):
        """Закрытие HTTP клиента."""
        if cls._client:
            await cls._client.aclose()
            cls._client = None
            log.debug("geo_service.closed")

    @classmethod
    async def get_location_name(cls, lat: float, lon: float) -> Optional[str]:
        """
        Reverse geocoding using Nominatim API + Redis Cache.
        """
        # 1. Try Cache
        cached_name = await RedisService.get_geo_location_name(lat, lon)
        if cached_name:
            # Если в кеше пустая строка (мы могли кешировать отсутствие результата), вернем None?
            # Нет, кеш должен хранить валидное имя.
            return cached_name

        if not cls._client:
             raise RuntimeError("GeoService is not initialized. Call GeoService.init() first.")

        try:
            response = await cls._client.get(
                cls._NOMINATIM_URL,
                params={
                    "lat": lat,
                    "lon": lon,
                    "format": "json",
                    "accept-language": "en",
                    "zoom": 10
                },
                headers={"User-Agent": cls._USER_AGENT}
            )
            response.raise_for_status()
            data = response.json()
            
            name = data.get("name")
            address = data.get("address", {})
            country = address.get("country")
            
            result_name = None

            if not name:
                name = address.get("city") or address.get("town") or address.get("village") or address.get("state")

            if name and country:
                if name.lower() == country.lower():
                    result_name = country
                else:
                    result_name = f"{name}, {country}"
            elif name:
                result_name = name
            elif country:
                result_name = country
            else:
                result_name = data.get("display_name")
            
            # Кешируем результат, если он есть
            if result_name:
                await RedisService.set_geo_location_name(lat, lon, result_name)
            
            return result_name

        except Exception as e:
            log.error(f"geo_service.error", lat=lat, lon=lon, error=str(e))
            return None
