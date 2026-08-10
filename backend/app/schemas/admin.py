"""Pydantic schemas for the Admin module (placeholders — Milestone 1)."""

from pydantic import BaseModel


class AdminOverviewStats(BaseModel):
    """Admin overview statistic cards."""

    total_reports: int = 0
    pending_verification: int = 0
    reports_resolved: int = 0
    active_users: int = 0


class SystemHealthMetric(BaseModel):
    """A single system-health indicator."""

    key: str
    label: str
    status: str
    status_label: str
    detail: str
    meta: str
    progress: int = 0


class AdminResponse(BaseModel):
    """Admin response envelope."""

    success: bool = True
    data: dict

