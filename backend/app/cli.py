import sys


def server() -> None:
    """Run the uvicorn server."""
    import uvicorn

    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload="--reload" in sys.argv,
    )


def migrate() -> None:
    """Run alembic migrations."""
    from alembic.config import main as alembic_main

    sys.argv = ["alembic"] + sys.argv[1:]
    alembic_main()


def clean_db() -> None:
    """Drop all tables and enums, preserve extensions (PostGIS)."""
    import asyncio
    import os

    from sqlalchemy import text

    if os.environ.get("ALLOW_DESTRUCTIVE_OPERATIONS") != "true":
        print("ERROR: Set ALLOW_DESTRUCTIVE_OPERATIONS=true to run this command")
        sys.exit(1)

    async def _clean():
        from app.utils.database import Database

        await Database.init()

        async with Database.get_session() as session:
            # Drop all tables except PostGIS system tables
            await session.execute(text("""
                DO $$ DECLARE r RECORD;
                BEGIN
                    FOR r IN (SELECT tablename FROM pg_tables
                              WHERE schemaname = 'public'
                              AND tablename NOT IN ('spatial_ref_sys', 'geometry_columns', 'geography_columns')) LOOP
                        EXECUTE 'DROP TABLE IF EXISTS public.' ||
                                quote_ident(r.tablename) || ' CASCADE';
                    END LOOP;
                END $$;
            """))

            # Drop all enums
            await session.execute(text("""
                DO $$ DECLARE r RECORD;
                BEGIN
                    FOR r IN (SELECT t.typname FROM pg_type t
                              JOIN pg_namespace n ON n.oid = t.typnamespace
                              WHERE n.nspname = 'public' AND t.typtype = 'e') LOOP
                        EXECUTE 'DROP TYPE IF EXISTS public.' ||
                                quote_ident(r.typname) || ' CASCADE';
                    END LOOP;
                END $$;
            """))

            print("Database cleaned! Extensions preserved.")

        await Database.close()

    asyncio.run(_clean())