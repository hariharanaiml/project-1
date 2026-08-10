"""Pydantic schemas for the RepairRecommendation model."""

from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import PriorityLevel


class RepairRecommendationCreate(BaseModel):
    """Request schema for creating a repair recommendation."""

    report_id: str
    recommendation: str = Field(min_length=5, max_length=3000)
    recommended_method: Optional[str] = Field(default=None, max_length=255)
    duration: Optional[str] = Field(default=None, max_length=64)
    priority: Optional[PriorityLevel] = None
    expected_response: Optional[str] = Field(default=None, max_length=64)
    equipment: Optional[list[str]] = None
    safety_notes: Optional[str] = None
    material_cost: Optional[Decimal] = Field(default=None, ge=0)
    labor_cost: Optional[Decimal] = Field(default=None, ge=0)
    equipment_cost: Optional[Decimal] = Field(default=None, ge=0)
    total_cost: Optional[Decimal] = Field(default=None, ge=0)


class RepairRecommendationUpdate(BaseModel):
    """Partial update for a repair recommendation."""

    recommendation: Optional[str] = Field(default=None, min_length=5, max_length=3000)
    recommended_method: Optional[str] = Field(default=None, max_length=255)
    duration: Optional[str] = Field(default=None, max_length=64)
    priority: Optional[PriorityLevel] = None
    expected_response: Optional[str] = Field(default=None, max_length=64)
    equipment: Optional[list[str]] = None
    safety_notes: Optional[str] = None
    material_cost: Optional[Decimal] = Field(default=None, ge=0)
    labor_cost: Optional[Decimal] = Field(default=None, ge=0)
    equipment_cost: Optional[Decimal] = Field(default=None, ge=0)
    total_cost: Optional[Decimal] = Field(default=None, ge=0)


class RepairRecommendationRead(BaseModel):
    """Response schema for a repair recommendation."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    report_id: str
    recommendation: str
    recommended_method: Optional[str] = None
    duration: Optional[str] = None
    priority: Optional[PriorityLevel] = None
    expected_response: Optional[str] = None
    equipment: Optional[list] = None
    safety_notes: Optional[str] = None
    material_cost: Optional[Decimal] = None
    labor_cost: Optional[Decimal] = None
    equipment_cost: Optional[Decimal] = None
    total_cost: Optional[Decimal] = None
    created_at: datetime
    updated_at: datetime


class RepairRecommendationResponse(BaseModel):
    """Response envelope for a single repair recommendation."""

    success: bool = True
    data: RepairRecommendationRead

