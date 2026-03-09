from typing import Optional

from redis.asyncio import Redis

from ..config import Config
from ..extensions.request_state_models import AuthContext
from ..utils.observability import get_logger

log = get_logger()


class RedisService:
    _redis: Redis = None
    _REFRESH_TOKEN_PREFIX = "refresh:"
    _OAUTH_STATE_PREFIX = "oauth_state:"
    _OAUTH_STATE_TTL = 600  # 10 минут

    _SWIPE_PREFIX = "swiped:"
    _SWIPE_TTL = 86400  # 24 часа

    @classmethod
    async def init(cls):
        """Инициализация пула соединений с Redis."""
        cls._redis = Redis(
            host=Config.redis.host,
            port=Config.redis.port,
            decode_responses=True,
            max_connections=20
        )
        try:
            if await cls._redis.ping():
                log.debug("redis.connected")
        except Exception as e:
            log.fatal("redis.connection_error", error=str(e))
            raise e

    @classmethod
    async def close(cls):
        """Закрытие соединения с Redis."""
        if cls._redis:
            await cls._redis.close()
            log.debug("redis.closed")

    # ─── Refresh Tokens ───────────────────────────────────────────────

    @classmethod
    async def store_refresh_token(
        cls, token: str, user_id: str, session_id: str
    ) -> None:
        """Сохраняет refresh token с данными сессии."""
        key = f"{cls._REFRESH_TOKEN_PREFIX}{token}"
        await cls._redis.hset(key, mapping={"user_id": user_id, "session_id": session_id})
        await cls._redis.expire(key, Config.auth.refresh_ttl_sec)

    @classmethod
    async def get_refresh_token(cls, token: str) -> Optional[AuthContext]:
        """Получает данные refresh token."""
        key = f"{cls._REFRESH_TOKEN_PREFIX}{token}"
        data = await cls._redis.hgetall(key)
        if not data:
            return None
        return AuthContext(user_id=data["user_id"], session_id=data["session_id"])

    @classmethod
    async def delete_refresh_token(cls, token: str) -> None:
        """Удаляет refresh token."""
        key = f"{cls._REFRESH_TOKEN_PREFIX}{token}"
        await cls._redis.delete(key)

    # ─── OAuth State ───────────────────────────────────────────────────

    @classmethod
    async def store_oauth_state(cls, state: str) -> None:
        """Сохраняет OAuth state для верификации."""
        key = f"{cls._OAUTH_STATE_PREFIX}{state}"
        await cls._redis.set(key, "1", ex=cls._OAUTH_STATE_TTL)

    @classmethod
    async def verify_oauth_state(cls, state: str) -> bool:
        """Проверяет и удаляет OAuth state (одноразовый)."""
        key = f"{cls._OAUTH_STATE_PREFIX}{state}"
        result = await cls._redis.delete(key)
        return result > 0

    # ─── Pub/Sub ───────────────────────────────────────────────────────

    @classmethod
    async def publish(cls, channel: str, message: str) -> int:
        """Публикация сообщения в канал."""
        return await cls._redis.publish(channel, message)

    @classmethod
    async def subscribe(cls, channel: str):
        """Подписка на канал. Возвращает PubSub объект."""
        pubsub = cls._redis.pubsub()
        await pubsub.subscribe(channel)
        return pubsub

    @classmethod
    async def unsubscribe(cls, pubsub, channel: str) -> None:
        """Отписка от канала."""
        await pubsub.unsubscribe(channel)
        await pubsub.close()




    # ─── Swipes ────────────────────────────────────────────────────────

    @classmethod
    async def mark_user_as_swiped(cls, user_id: str, target_id: str) -> None:
        """
        Помечает, что пользователь 'user_id' свайпнул 'target_id'.
        ID цели добавляется в Set с ключом пользователя.
        """
        key = f"{cls._SWIPE_PREFIX}{user_id}"
        # Добавляем ID в множество
        await cls._redis.sadd(key, target_id)
        # Обновляем TTL, чтобы список не жил вечно (например, обновляем раз в сутки)
        await cls._redis.expire(key, cls._SWIPE_TTL)

    @classmethod
    async def get_swiped_user_ids(cls, user_id: str) -> list[str]:
        """
        Возвращает список всех ID, которые текущий пользователь уже свайпнул.
        Используется для исключения этих анкет в SQL запросе.
        """
        key = f"{cls._SWIPE_PREFIX}{user_id}"
        # Получаем все элементы множества
        swiped_ids = await cls._redis.smembers(key)
        return list(swiped_ids)

    # ─── Geo Cache ─────────────────────────────────────────────────────

    _GEO_PREFIX = "geo:"
    _GEO_TTL = 604800  # 7 дней

    @classmethod
    async def get_geo_location_name(cls, lat: float, lon: float) -> Optional[str]:
        """Получает закешированное название локации."""
        key = f"{cls._GEO_PREFIX}{lat:.4f}:{lon:.4f}"
        return await cls._redis.get(key)

    @classmethod
    async def set_geo_location_name(cls, lat: float, lon: float, name: str) -> None:
        """Сохраняет название локации в кеш."""
        key = f"{cls._GEO_PREFIX}{lat:.4f}:{lon:.4f}"
        await cls._redis.set(key, name, ex=cls._GEO_TTL)
