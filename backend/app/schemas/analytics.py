"""Pydantic schemas for the Analytics module (placeholders — Milestone 1)."""

from typing import Optional

from pydantic import BaseModel, Field


class AnalyticsOverview(BaseModel):
    """Overview statistic cards for analytics."""

    total_reports: int = 0
    resolved_reports: int = 0
    pending_reports: int = 0
    critical_reports: int = 0


class TrendPoint(BaseModel):
    """A single point on the reports-trend chart."""

    month: str
    reports: int


class DamageTypeDistribution(BaseModel):
    """One slice of the damage-type pie chart."""

    name: str
    value: int


class SeverityDistribution(BaseModel):
    """One bar of the severity bar chart."""

    severity: str
    count: int


class AnalyticsResponse(BaseModel):
    """Analytics response envelope."""

    success: bool = True
    data: dict

