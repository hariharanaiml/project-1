"""
Inspection persistence service — Milestone: Inspection History & Analytics.

Persists a **successful** real YOLOv8 pipeline result as an ``AIAnalysis``
record and backfills the owning ``Report`` with AI-derived fields.

The flow becomes:

    Upload Image → YOLOv8 → Detection → Severity → Cost → Recommendation
        → Save Inspection (this service) → Dashboard Analytics

Design notes:
- Reuses the existing ``AIAnalysis`` + ``Report`` ORM models — no new tables.
- Only called for successful inferences (``damage_detected`` flag respected).
- Failed AI requests are NOT saved as successful inspections.
- Delegates to the existing repositories so transactions/sessions stay consistent.
"""

import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.core.logging import get_logger
from app.models.ai_analysis import AIAnalysis
from app.models.enums import (
    AIConfidenceLevel,
    AnalysisStatus,
    DamageType,
    PriorityLevel,
    SeverityLevel,
)
from app.models.report import Report
from app.repositories.ai_analysis_repository import AIAnalysisRepository
from app.repositories.report_repository import ReportRepository

logger = get_logger(__name__)

# Map canonical YOLO labels to legacy DamageType enum values when the raw
# label is not itself a valid enum value (mirrors pipeline._map_to_legacy_type).
_LEGACY_DAMAGE_MAP = {
    "pothole": "pothole",
    "alligator_crack": "alligator_cracks",
    "longitudinal_crack": "crack",
    "transverse_crack": "crack",
    "patchy_road_section": "surface_wear",
    "lane_line_blur": "other",
    "manhole_cover": "other",
}


def _safe_damage_type(label):
    """Convert a damage label to DamageType with legacy-mapping fallback."""
    if not label:
        return None
    value = str(label).lower()
    try:
        return DamageType(value)
    except ValueError:
        mapped = _LEGACY_DAMAGE_MAP.get(value)
        if mapped:
            try:
                return DamageType(mapped)
            except ValueError:
                pass
        return DamageType("other")


def _safe_severity(label):
    """Convert a severity label to SeverityLevel (None when unknown)."""
    if not label:
        return None
    try:
        return SeverityLevel(str(label).lower())
    except ValueError:
        return None


def _safe_priority(label):
    """Convert a priority label to PriorityLevel (None when unknown)."""
    if not label:
        return None
    try:
        return PriorityLevel(str(label).lower())
    except ValueError:
        return None


def _confidence_level(score: float) -> AIConfidenceLevel:
    """Map a confidence score (0–1) to an AIConfidenceLevel bucket."""
    if score >= 0.9:
        return AIConfidenceLevel.HIGH
    if score >= 0.7:
        return AIConfidenceLevel.MEDIUM
    return AIConfidenceLevel.LOW


class InspectionPersistenceService:
    """
    Orchestrates persistence of real AI inspection results.

    Mirrors the persistence contract of the mock ``AIAnalysisService`` so the
    real pipeline and the mock pipeline write the same shape into the DB.
    """

    def __init__(self, db: Session) -> None:
        self.db = db
        self.analysis_repo = AIAnalysisRepository(db)
        self.report_repo = ReportRepository(db)

    # ── Public API ──────────────────────────────────────────────────────────────

    def persist_result(
        self,
        result: dict,
        report_id: Optional[str] = None,
        image_path: Optional[str] = None,
    ) -> Optional[AIAnalysis]:
        """
        Persist a successful real-AI inference result.

        Args:
            result:    The structured pipeline result dict (mock=False).
            report_id: Optional report id to attach the analysis to.
            image_path: Optional stored image path (falls back to result's).

        Returns:
            The created ``AIAnalysis`` ORM row, or ``None`` if the result
            indicates a failed pipeline run.

        Raises:
            NotFoundError: if ``report_id`` is provided but does not exist.
        """
        if not result or result.get("error") or not result.get("success", True):
            logger.info("Skipping persistence for failed/non-successful AI result")
            return None

        # If a report_id was supplied, ensure it exists (404 otherwise).
        if report_id:
            report = self.report_repo.get(report_id)
            if not report:
                from app.core.exceptions import NotFoundError

                raise NotFoundError(f"Report {report_id} not found")
        else:
            report = None

        analysis_id = result.get("analysis_id") or str(uuid.uuid4())
        resolved_image_path = (
            image_path or result.get("image_path") or (report.image_path if report else None)
        )

        # ── Build + persist the AIAnalysis row ──────────────────────────────────
        analysis = self._build_analysis(result, report_id, resolved_image_path, analysis_id)
        self.analysis_repo.save(analysis)

        # ── Backfill the Report with AI-derived fields ──────────────────────────
        if report is not None:
            self._update_report(report, result, resolved_image_path)
            self.report_repo.save(report)

        logger.info(
            "Persisted AI inspection %s for report %s (damage=%s severity=%s)",
            analysis.id,
            report_id or "-",
            result.get("damage_type"),
            result.get("severity"),
        )
        return analysis

    # ── Internals ───────────────────────────────────────────────────────────────

    def _build_analysis(
        self,
        result: dict,
        report_id: Optional[str],
        image_path: Optional[str],
        analysis_id: str,
    ) -> AIAnalysis:
        """Build an AIAnalysis ORM row from a real pipeline result dict."""
        damage = result.get("damage_type")
        severity_label = result.get("severity")
        confidence = float(result.get("confidence") or 0.0)
        cost = result.get("estimated_repair_cost")
        priority = result.get("priority")
        detections = result.get("detections") or []
        bounding_boxes = result.get("bounding_boxes") or []

        return AIAnalysis(
            id=analysis_id,
            report_id=report_id,
            model_version=result.get("model_version") or "yolov8-best-v1",
            analysis_status=AnalysisStatus.COMPLETED,
            processing_time_ms=result.get("processing_time_ms"),
            damage_type=_safe_damage_type(damage),
            severity=_safe_severity(severity_label),
            confidence_score=confidence,
            confidence_level=_confidence_level(confidence),
            risk_score=result.get("risk_score"),
            overall_damage_score=result.get("overall_damage_score"),
            description=result.get("summary"),
            repair_cost=cost,
            repair_recommendation=result.get("summary"),
            detections=detections,
            bounding_boxes=bounding_boxes,
            analysis_metadata={
                "repair_method": result.get("repair_method"),
                "priority": priority,
                "expected_duration_days": result.get("expected_duration_days"),
                "equipment": result.get("equipment") or [],
                "notes": result.get("notes"),
                "cost_breakdown": result.get("cost_breakdown") or {},
                "road_condition": result.get("road_condition"),
                "cost_range": result.get("cost_range"),
                "currency": result.get("currency"),
                "image_path": image_path,
                "annotated_image_url": result.get("annotated_image_url"),
            },
            completed_at=datetime.now(timezone.utc),
        )

    def _update_report(
        self,
        report: Report,
        result: dict,
        image_path: Optional[str],
    ) -> None:
        """Backfill AI-derived fields onto the Report entity."""
        severity_label = result.get("severity")
        damage = result.get("damage_type")
        priority = result.get("priority")

        report.ai_processed = True
        if image_path:
            report.image_path = image_path

        safe_severity = _safe_severity(severity_label)
        if safe_severity is not None:
            report.severity = safe_severity
        elif severity_label:
            logger.warning("Unknown severity label %r — leaving unchanged", severity_label)

        safe_damage = _safe_damage_type(damage)
        if safe_damage is not None:
            report.damage_type = safe_damage
        elif damage:
            logger.warning("Unknown damage label %r — leaving unchanged", damage)

        safe_priority = _safe_priority(priority)
        if safe_priority is not None:
            report.priority = safe_priority
        elif priority:
            logger.warning("Unknown priority label %r — leaving unchanged", priority)
        if result.get("confidence"):
            report.confidence = round(float(result["confidence"]), 4)
        if result.get("estimated_repair_cost"):
            report.estimated_repair_cost = result["estimated_repair_cost"]