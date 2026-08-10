"""
Health check service.

Provides a DB connectivity check used by the `/api/health` endpoint so the
frontend/ops can verify both the API and its database are reachable.
"""

from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.core.logging import get_logger
from app.db.session import SessionLocal

logger = get_logger(__name__)


def check_database() -> bool:
    """Return True if the database accepts a simple query, False otherwise."""
    try:
        with SessionLocal() as session:
            session.execute(text("SELECT 1"))
        return True
    except SQLAlchemyError as exc:  # pragma: no cover - depends on infra state
        logger.error("Database health check failed: %s", exc)
        return False


def build_health_status() -> dict:
    """Build the health check payload.

    Contract (Milestone 2): exactly two fields, no extras.
        Healthy:   {"status": "ok", "database": "connected"}
        Degraded:  {"status": "degraded", "database": "unavailable"}
    """
    db_ok = check_database()
    return {
        "status": "ok" if db_ok else "degraded",
        "database": "connected" if db_ok else "unavailable",
    }

