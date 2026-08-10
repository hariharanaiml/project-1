"""
Database engine and session management (SQLAlchemy 2.0 style).

Fully PostgreSQL compatible — the only difference is the DATABASE_URL.
SQLite is used as the default development database; switching to PostgreSQL
is a one-line `.env` change. No SQLite-specific SQL is used anywhere.

Note: `check_same_thread` is only applied for the sqlite driver and is
harmless/no-op for PostgreSQL.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings


def _build_engine_kwargs(database_url: str) -> dict:
    """Return engine kwargs appropriate for the configured database driver."""
    kwargs: dict = {
        "pool_pre_ping": True,
    }

    if database_url.startswith("sqlite"):
        # SQLite needs this for FastAPI's threaded request handling.
        kwargs["connect_args"] = {"check_same_thread": False}
    else:
        # PostgreSQL defaults: a reasonably sized connection pool.
        kwargs["pool_size"] = 10
        kwargs["max_overflow"] = 20
        kwargs["pool_recycle"] = 1800

    return kwargs


engine = create_engine(
    settings.database_url,
    **(_build_engine_kwargs(settings.database_url)),
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, expire_on_commit=False)


class Base(DeclarativeBase):
    """Declarative base class for all ORM models."""


def get_db():
    """
    FastAPI dependency that yields a database session and always closes it.

    Usage:
        @router.get("/...")
        def endpoint(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

