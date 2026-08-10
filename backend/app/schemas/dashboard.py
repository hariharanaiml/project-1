"""Pydantic schemas for the Dashboard module (placeholders — Milestone 1)."""

from pydantic import BaseModel


class DashboardOverview(BaseModel):
    """Overview statistics shown on the dashboard."""

    total_reports: int = 0
    pending_reports: int = 0
    resolved_reports: int = 0
    critical_reports: int = 0
    active_users: int = 0


class RecentActivityItem(BaseModel):
    """A single recent activity item on the dashboard."""

    id: str
    report_number: str
    road_name: str
    damage_type: str
    status: str
    timestamp: str


class DashboardResponse(BaseModel):
    """Dashboard response envelope."""

    success: bool = True
    data: dict

