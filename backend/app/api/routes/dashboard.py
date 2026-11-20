"""Dashboard routes — real DB-derived overview, and inspection analytics."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.responses import ok_response
from app.services.inspection_stats_service import (
    compute_damage_breakdown,
    compute_dashboard_stats,
    list_map_inspections,
    list_recent_inspections,
)
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


@router.get("/stats", summary="Inspection statistics")
async def inspection_stats_endpoint(db: Session = Depends(get_db)) -> dict:
    """
    Return aggregate dashboard statistics derived from **real stored
    inspection data** (completed `ai_analyses`).

    Includes: total inspections, total detected damages, total potholes,
    total cracks, high/medium/low priority counts, and estimated total
    repair cost. Returns zeroed counts (no fake numbers) when no data exists.
    """
    return ok_response(compute_dashboard_stats(db))


@router.get("/damage-breakdown", summary="Damage category breakdown")
async def damage_breakdown_endpoint(db: Session = Depends(get_db)) -> dict:
    """
    Return a damage-category breakdown of real stored inspections.

    Categories: pothole, alligator crack, longitudinal crack, transverse
    crack, lane line blur, manhole cover, patchy road section.
    """
    return ok_response({"items": compute_damage_breakdown(db)})


@router.get("/recent-inspections", summary="Recent inspections")
async def recent_inspections_endpoint(
    limit: int = Query(default=10, ge=1, le=50),
    db: Session = Depends(get_db),
) -> dict:
    """Return the most recent AI inspections with report context."""
    return ok_response({"items": list_recent_inspections(db, limit=limit)})


@router.get("/map-inspections", summary="Map inspection markers")
async def map_inspections_endpoint(
    limit: int = Query(default=500, ge=1, le=2000),
    db: Session = Depends(get_db),
) -> dict:
    """
    Return inspections that have GPS coordinates for map visualization.

    Only visualization data is exposed (damage type, severity, priority,
    confidence, cost, coordinates, date). No user/private information.
    """
    return ok_response({"items": list_map_inspections(db, limit=limit)})
