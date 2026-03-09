from contextlib import asynccontextmanager
from typing import AsyncGenerator
from uuid import uuid4

from sqlalchemy import NullPool, text
from sqlalchemy.ext.asyncio import async_sessionmaker, AsyncEngine, AsyncSession, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from .observability import get_logger
from ..config import Config

log = get_logger()

class Base(DeclarativeBase):
    """Базовый класс для всех моделей"""
    pass


class Database:
    _engine: AsyncEngine = None
    _SessionLocal: async_sessionmaker = None

    @classmethod
    async def init(cls):
        """
        Инициализирует базу данных, создавая движок и фабрику сессий.
        Поддерживает два режима работы через DB_POOL_MODE:
        - "transaction" - для PgBouncer/Odyssey в transaction mode
        - "session" - для прямого подключения или session mode пулера
        """
        if cls._engine is None:
            if Config.db.pool_mode == "transaction":
                # Конфигурация для transaction mode пулера (PgBouncer/Odyssey)
                # NullPool - отключаем внутренний пул SQLAlchemy, т.к. пулер управляет соединениями
                # prepared_statement_cache_size=0 - отключаем кеш prepared statements
                # statement_cache_size=0 - отключаем кеш statements на уровне asyncpg
                # prepared_statement_name_func - уникальные имена для prepared statements
                cls._engine = create_async_engine(
                    Config.db.async_dsn,
                    echo=False,
                    poolclass=NullPool,
                    connect_args={
                        "prepared_statement_cache_size": 0,
                        "statement_cache_size": 0,
                        "prepared_statement_name_func": lambda: f"__asyncpg_{uuid4()}__",
                    },
                )
                log.info("database.init", pool_mode="transaction")
            else:
                # Конфигурация для session mode или прямого подключения
                cls._engine = create_async_engine(
                    Config.db.async_dsn,
                    echo=False,
                    pool_size=20,
                    max_overflow=10,
                    pool_timeout=10,
                    pool_use_lifo=True,
                )
                log.info("database.init", pool_mode="session")

            cls._SessionLocal = async_sessionmaker(
                bind=cls._engine,
                class_=AsyncSession,
                expire_on_commit=False,
            )

    @classmethod
    @asynccontextmanager
    async def get_session(cls) -> AsyncGenerator[AsyncSession, None]:
        if cls._SessionLocal is None:
            raise RuntimeError("Database is not initialized. Call Database.init() first.")

        async with cls._SessionLocal() as session:
            log.debug("session_created")
            async with session.begin():
                yield session

    @classmethod
    async def close(cls):
        if cls._engine:
            await cls._engine.dispose()

    @classmethod
    async def test_connection(cls) -> bool:
        """
        Тестирует соединение с базой данных.
        """
        try:
            async with cls.get_session() as session:
                await session.execute(text("SELECT 1"))
            log.info("database_connection_successful")
            return True
        except Exception as e:
            log.fatal("database_connection_failed", error=str(e))
            return False
