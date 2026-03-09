from contextlib import asynccontextmanager

from app.services.redis_service import RedisService
from app.services.geo_service import GeoService
from app.utils.database import Database
from app.utils.observability import get_logger

log = get_logger()


@asynccontextmanager
async def lifespan(_):
    try:
        await Database.init()
        if not await Database.test_connection():
            raise RuntimeError("Database connection test failed during app startup.")
        await RedisService.init()
        await GeoService.init()
        yield
    except Exception as e:
        log.fatal("init.error", error=str(e))
        raise e
    finally:
        await Database.close()
        await RedisService.close()
        await GeoService.close()
