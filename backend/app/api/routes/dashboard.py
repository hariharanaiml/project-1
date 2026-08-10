"""Dashboard routes — real DB-derived overview and activity data."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.responses import ok_response
from app.services.stats_service import dashboard_overview, recent_activity

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/overview", summary="Dashboard overview")
async def dashboard_overview_endpoint(db: Session = Depends(get_db)) -> dict:
    """Return aggregate dashboard overview statistics."""
    return ok_response(dashboard_overview(db))


@router.get("/recent-activity", summary="Recent activity")
async def recent_activity_endpoint(
    limit: int = Query(default=10, ge=1, le=50),
    db: Session = Depends(get_db),
) -> dict:
    """Return the most recent report activity."""
    return ok_response({"items": recent_activity(db, limit=limit)})
