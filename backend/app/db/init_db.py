"""
Database initialization helper.

Used by the app lifespan when AUTO_CREATE_TABLES=true (dev convenience).
Alembic migrations remain the recommended source of truth for the schema.
"""

from app.core.config import settings
from app.core.logging import get_logger
from app.db.session import Base, engine

logger = get_logger(__name__)


def init_db() -> None:
    """
    Create all tables if they don't exist.

    Intended for quick local development only. In production, use Alembic.
    """
    if not settings.auto_create_tables:
        logger.info("AUTO_CREATE_TABLES=false — skipping create_all (use Alembic).")
        return

    logger.info("Creating database tables (AUTO_CREATE_TABLES=true)...")
    # Import models to register them with Base.metadata.
    from app.db import base as _  # noqa: F401

    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully.")

