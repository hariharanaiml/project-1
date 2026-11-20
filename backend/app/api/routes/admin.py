"""Admin routes — real DB-derived overview, user list, and system health."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_admin
from app.core.responses import ok_response
from app.services.stats_service import admin_overview, admin_users, system_health

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/stats", summary="Admin stats")
async def admin_stats_endpoint(
    db: Session = Depends(get_db),
    _: object = Depends(get_current_admin),
) -> dict:
    """Return aggregate admin statistics (admin only)."""
    return ok_response(admin_overview(db))


@router.get("/overview", summary="Admin overview")
async def admin_overview_endpoint(
    db: Session = Depends(get_db),
    _: object = Depends(get_current_admin),
) -> dict:
    """Return aggregate admin overview statistics (admin only)."""
    return ok_response(admin_overview(db))


@router.get("/users", summary="List users")
async def admin_users_endpoint(
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
    _: object = Depends(get_current_admin),
) -> dict:
    """Return the most recent platform users (admin only)."""
    return ok_response(admin_users(db, limit=limit))


@router.get("/system-health", summary="System health")
async def system_health_endpoint(
    db: Session = Depends(get_db),
    _: object = Depends(get_current_admin),
) -> dict:
    """Return live system-health metrics (admin only)."""
    return ok_response({"metrics": system_health(db)})
