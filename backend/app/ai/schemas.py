"""
AI inference data contracts (Phase 13 — Milestone 2 scaffold).

Defines the plain types / dataclasses used by the pipeline so the API contract
is agreed up front and stays consistent with the mock ``AIService`` output.

Import-safe scaffold only — this module must not import heavy deps
(``ultralytics`` / ``torch`` / ``cv2``). Full implementation lands in
Milestone 3.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


@dataclass
class Detection:
    """A single object detection produced by the model."""

    label: str
    confidence: float
    bbox: List[float]  # normalized [x1, y1, x2, y2]
    class_id: Optional[int] = None


@dataclass
class InferenceResult:
    """Structured result of a full inference run (contract-compatible with mock)."""

    detections: List[Detection] = field(default_factory=list)
    damage_type: Optional[str] = None
    severity: Optional[str] = None
    confidence: float = 0.0
    estimated_repair_cost: Optional[float] = None
    repair_method: Optional[str] = None
    priority: Optional[str] = None
    summary: Optional[str] = None
    risk_score: Optional[float] = None
    overall_damage_score: Optional[float] = None
    annotated_image_url: Optional[str] = None
    processing_time_ms: Optional[float] = None
    mock: bool = False
    extra: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """Return the result as a plain dict (extra fields merged in)."""
        base: Dict[str, Any] = {
            "detections": [d.__dict__ for d in self.detections],
            "damage_type": self.damage_type,
            "severity": self.severity,
            "confidence": self.confidence,
            "estimated_repair_cost": self.estimated_repair_cost,
            "repair_method": self.repair_method,
            "priority": self.priority,
            "summary": self.summary,
            "risk_score": self.risk_score,
            "overall_damage_score": self.overall_damage_score,
            "annotated_image_url": self.annotated_image_url,
            "processing_time_ms": self.processing_time_ms,
            "mock": self.mock,
        }
        base.update(self.extra)
        return base
