"""Pydantic schemas for the AI module (placeholders — Milestone 1).

The YOLOv8 detection pipeline lands in Milestone 2; these contracts define the
expected request/response shapes so the frontend and services can align.
"""

from typing import Optional

from pydantic import BaseModel, Field

from app.models.enums import DamageType, SeverityLevel


class AIDetectionRequest(BaseModel):
    """Request to run AI detection on an uploaded image."""

    report_id: str
    image_path: Optional[str] = None
    model_version: Optional[str] = None


class AIDetectionResult(BaseModel):
    """Primary result of an AI detection run."""

    damage_type: DamageType
    severity: SeverityLevel
    confidence: float = Field(ge=0.0, le=1.0)
    confidence_label: str
    risk_score: float = Field(ge=0.0, le=100.0)
    overall_damage_score: float = Field(ge=0.0, le=100.0)


class AIDetectionResponse(BaseModel):
    """AI detection response envelope."""

    success: bool = True
    data: dict

