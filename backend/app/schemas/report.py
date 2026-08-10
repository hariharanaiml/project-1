"""Pydantic schemas for the Report model."""

from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.models.enums import (
    DamageType,
    PriorityLevel,
    ReportStatus,
    RoadType,
    SeverityLevel,
)


class ReportBase(BaseModel):
    """Fields accepted when creating/updating a report."""

    road_name: str = Field(min_length=2, max_length=255)
    description: str = Field(min_length=10, max_length=2000)
    road_type: Optional[RoadType] = None
    address: Optional[str] = Field(default=None, max_length=500)
    latitude: Optional[float] = Field(default=None, ge=-90, le=90)
    longitude: Optional[float] = Field(default=None, ge=-180, le=180)

    @field_validator("latitude", "longitude")
    @classmethod
    def validate_coords(cls, value: Optional[float]) -> Optional[float]:
        if value is not None:
            return round(value, 6)
        return value

    @model_validator(mode="after")
    def validate_coordinate_pair(self) -> "ReportBase":
        """Ensure latitude and longitude are provided (or omitted) together."""
        if (self.latitude is None) != (self.longitude is None):
            raise ValueError("latitude and longitude must be provided together")
        return self


class ReportCreate(ReportBase):
    """Request schema for creating a report."""

    user_id: Optional[str] = None
    # Fields below are typically populated by the AI pipeline (Milestone 3) but
    # are accepted at creation time so the schema is future-proof and flexible.
    image_path: Optional[str] = Field(default=None, max_length=500)
    severity: Optional[SeverityLevel] = None
    damage_type: Optional[DamageType] = None
    priority: Optional[PriorityLevel] = None


class ReportStatusUpdate(BaseModel):
    """Request schema for updating a report's status."""

    status: ReportStatus


class ReportUpdate(BaseModel):
    """Partial update for report fields (excluding status, see ReportStatusUpdate)."""

    road_name: Optional[str] = Field(default=None, min_length=2, max_length=255)
    description: Optional[str] = Field(default=None, min_length=10, max_length=2000)
    road_type: Optional[RoadType] = None
    address: Optional[str] = Field(default=None, max_length=500)
    latitude: Optional[float] = Field(default=None, ge=-90, le=90)
    longitude: Optional[float] = Field(default=None, ge=-180, le=180)
    severity: Optional[SeverityLevel] = None
    damage_type: Optional[DamageType] = None
    priority: Optional[PriorityLevel] = None

    @model_validator(mode="after")
    def validate_coordinate_pair(self) -> "ReportUpdate":
        """Ensure latitude and longitude are provided (or omitted) together."""
        if (self.latitude is None) != (self.longitude is None):
            raise ValueError("latitude and longitude must be provided together")
        return self


class ReportRead(BaseModel):
    """Response schema for a report."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    report_number: str
    user_id: Optional[str] = None
    road_name: str
    description: str
    road_type: Optional[RoadType] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: ReportStatus
    severity: Optional[SeverityLevel] = None
    damage_type: Optional[DamageType] = None
    priority: Optional[PriorityLevel] = None
    image_path: Optional[str] = None
    ai_processed: bool = False
    confidence: Optional[float] = None
    estimated_repair_cost: Optional[Decimal] = None
    submitted_date: datetime
    resolved_at: Optional[datetime] = None
    updated_at: datetime


class ReportReplace(ReportBase):
    """
    Full replacement payload for PUT /reports/{id}.

    Unlike PATCH, every mutable field is overwritten with the supplied
    values. `road_name` and `description` are required.
    """

    image_path: Optional[str] = Field(default=None, max_length=500)
    severity: Optional[SeverityLevel] = None
    damage_type: Optional[DamageType] = None
    priority: Optional[PriorityLevel] = None


class ReportResponse(BaseModel):
    """Single-resource success envelope for report endpoints."""

    success: bool = True
    data: ReportRead


class ReportListResponse(BaseModel):
    """Response envelope for a list of reports."""

    success: bool = True
    data: list[ReportRead]
    total: int
    page: Optional[int] = None
    page_size: Optional[int] = None

