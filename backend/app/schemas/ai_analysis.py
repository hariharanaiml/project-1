"""Pydantic schemas for the AIAnalysis model and AI analysis response contract."""

from datetime import datetime
from decimal import Decimal
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import (
    AIConfidenceLevel,
    AnalysisStatus,
    DamageType,
    PriorityLevel,
    SeverityLevel,
)


class DetectionItem(BaseModel):
    """A single detection result from the AI pipeline."""

    label: str
    confidence: float = Field(ge=0.0, le=1.0)
    severity: Optional[SeverityLevel] = None
    risk_score: Optional[float] = None
    bbox: Optional[list[float]] = None  # [x1, y1, x2, y2] normalized


class BoundingBoxItem(BaseModel):
    """A single bounding box overlay."""

    label: str
    confidence: float = Field(ge=0.0, le=1.0)
    x1: float = Field(ge=0.0, le=1.0)
    y1: float = Field(ge=0.0, le=1.0)
    x2: float = Field(ge=0.0, le=1.0)
    y2: float = Field(ge=0.0, le=1.0)


class AIAnalysisCreate(BaseModel):
    """Request schema for triggering an AI analysis."""

    report_id: str
    image_path: Optional[str] = None


class AIAnalysisUpdate(BaseModel):
    """Partial update for an AI analysis record."""

    analysis_status: Optional[AnalysisStatus] = None
    model_version: Optional[str] = None
    processing_time_ms: Optional[int] = None
    damage_type: Optional[DamageType] = None
    severity: Optional[SeverityLevel] = None
    confidence_score: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    confidence_level: Optional[AIConfidenceLevel] = None
    risk_score: Optional[float] = None
    overall_damage_score: Optional[float] = None
    description: Optional[str] = None
    repair_cost: Optional[Decimal] = None
    repair_recommendation: Optional[str] = None
    detections: Optional[list[Any]] = None
    bounding_boxes: Optional[list[Any]] = None
    analysis_metadata: Optional[dict] = None
    completed_at: Optional[datetime] = None


class AIAnalysisRead(BaseModel):
    """Response schema for an AI analysis."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    report_id: str
    model_version: Optional[str] = None
    analysis_status: AnalysisStatus
    processing_time_ms: Optional[int] = None
    damage_type: Optional[DamageType] = None
    severity: Optional[SeverityLevel] = None
    confidence_score: Optional[float] = None
    confidence_level: Optional[AIConfidenceLevel] = None
    risk_score: Optional[float] = None
    overall_damage_score: Optional[float] = None
    description: Optional[str] = None
    repair_cost: Optional[Decimal] = None
    repair_recommendation: Optional[str] = None
    detections: Optional[list] = None
    bounding_boxes: Optional[list] = None
    analysis_metadata: Optional[dict] = None
    created_at: datetime
    completed_at: Optional[datetime] = None


class AIAnalysisListResponse(BaseModel):
    """Response envelope for a list of AI analyses."""

    success: bool = True
    data: list[AIAnalysisRead]
    total: int


# ── AI analysis response contract (Milestone 5) ─────────────────────────────────


class AIResponse(BaseModel):
    """
    Structured AI analysis response returned by `POST /api/v1/ai/analyze`.

    Mirrors the Milestone 5 spec contract:
      report_id, image_path, damage_detected, damage_type, severity,
      confidence, estimated_repair_cost, repair_method, priority,
      analysis_id, model_version.
    """

    report_id: str
    image_path: Optional[str] = None
    analysis_id: Optional[str] = None
    model_version: Optional[str] = None

    damage_detected: bool
    damage_type: Optional[DamageType] = None
    severity: Optional[SeverityLevel] = None
    confidence: Optional[float] = Field(default=None, ge=0.0, le=1.0)

    estimated_repair_cost: Optional[Decimal] = None
    repair_method: Optional[str] = None
    priority: Optional[PriorityLevel] = None

    summary: Optional[str] = None
    detections: Optional[list[dict]] = None
    mock: bool = True


class AIResponseEnvelope(BaseModel):
    """Standard success envelope for the AI analysis endpoint."""

    success: bool = True
    data: AIResponse
    meta: Optional[dict] = None

