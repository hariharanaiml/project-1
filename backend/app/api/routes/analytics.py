"""Analytics routes — real DB-derived trends and distributions."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.responses import ok_response
from app.services.stats_service import (
    analytics_distributions,
    analytics_overview,
    analytics_trends,
)

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/overview", summary="Analytics overview")
async def analytics_overview_endpoint(db: Session = Depends(get_db)) -> dict:
    """Return aggregate analytics overview statistics."""
    return ok_response(analytics_overview(db))


@router.get("/trends", summary="Reports trend")
async def analytics_trends_endpoint(db: Session = Depends(get_db)) -> dict:
    """Return the monthly reports trend (last 12 months)."""
    return ok_response(analytics_trends(db))


@router.get("/distributions", summary="Damage/severity distributions")
async def analytics_distributions_endpoint(db: Session = Depends(get_db)) -> dict:
    """Return damage-type, severity, and top-location distributions."""
    return ok_response(analytics_distributions(db))
