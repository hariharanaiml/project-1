"""
AI Analysis orchestration service — Milestone 5.

Coordinates the mock AIService with persistence:

  1. Validates the target report exists (404 otherwise).
  2. Runs the **mock** analysis pipeline (no real inference).
  3. Persists an ``AIAnalysis`` row capturing the result.
  4. Updates the ``Report`` with AI-derived fields (image path, processed
     flag, severity, damage type, confidence, estimated repair cost).

The real YOLOv8 pipeline will replace the mock service behind the same
interface in a later milestone.
"""

import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.core.logging import get_logger
from app.models.ai_analysis import AIAnalysis
from app.models.enums import AnalysisStatus, AIConfidenceLevel, DamageType, SeverityLevel
from app.models.report import Report
from app.repositories.ai_analysis_repository import AIAnalysisRepository
from app.repositories.report_repository import ReportRepository
from app.services.ai_service import MOCK_MODEL_VERSION, ai_service

logger = get_logger(__name__)


def _confidence_level(score: float) -> AIConfidenceLevel:
    """Map a confidence score (0–1) to an AIConfidenceLevel bucket."""
    if score >= 0.9:
        return AIConfidenceLevel.HIGH
    if score >= 0.7:
        return AIConfidenceLevel.MEDIUM
    return AIConfidenceLevel.LOW


def _severity_from_label(label: str) -> SeverityLevel:
    """Map a mock damage label to a SeverityLevel."""
    label = (label or "").lower()
    if label in {"pothole", "alligator_cracks"}:
        return SeverityLevel.HIGH
    if label in {"crack", "edge_failure"}:
        return SeverityLevel.MEDIUM
    return SeverityLevel.LOW


class AIAnalysisService:
    """Orchestrates the mock AI pipeline, persistence, and report updates."""

    def __init__(self, db: Session) -> None:
        self.db = db
        self.repo = AIAnalysisRepository(db)
        self.report_repo = ReportRepository(db)
        self.ai_service = ai_service

    # ── Public API ──────────────────────────────────────────────────────────────

    def analyze_report(self, report_id: str, image_path: Optional[str] = None) -> dict:
        """
        Run the (mock) AI pipeline for a report and persist the result.

        Args:
            report_id: The report to analyze.
            image_path: Optional stored-image URL/path.

        Returns:
            The structured AI response dict (matches the `AIResponse` schema).

        Raises:
            NotFoundError: if the report does not exist.
        """
        report = self.report_repo.get(report_id)
        if not report:
            raise NotFoundError(f"Report {report_id} not found")

        image_path = image_path or report.image_path or f"uploads/{report.report_number}.jpg"

        # 1. Run mock analysis.
        analysis_id = str(uuid.uuid4())
        result = self.ai_service.analyze_image(
            image_path=image_path,
            report_id=report_id,
            analysis_id=analysis_id,
        )

        # 2. Persist AIAnalysis record.
        analysis = self._build_record(result, report_id)
        self.repo.save(analysis)

        # 3. Update the report with AI-derived fields.
        self._update_report(report, result)
        self.repo.save(report)

        result["analysis_id"] = analysis.id
        logger.info("Persisted AI analysis %s for report %s", analysis.id, report_id)
        return result

    # ── Query API (GET endpoints) ───────────────────────────────────────────────

    def get_latest_analysis(self) -> dict:
        """
        Return the most recent AI analysis (with its report context).

        Raises:
            NotFoundError: if no analysis exists yet.
        """
        analysis = self.repo.get_latest()
        if not analysis:
            raise NotFoundError("No AI analysis has been run yet")
        return self._to_dict(analysis)

    def get_analysis(self, analysis_id: str) -> dict:
        """
        Return a single AI analysis by id (with report context).

        Raises:
            NotFoundError: if the analysis does not exist.
        """
        analysis = self.repo.get(analysis_id)
        if not analysis:
            raise NotFoundError(f"AI analysis {analysis_id} not found")
        return self._to_dict(analysis)

    def list_analyses(self, report_id: Optional[str] = None, limit: int = 20) -> list:
        """
        Return recent analyses, optionally filtered to a single report.

        Raises:
            NotFoundError: if report_id is given but the report does not exist.
        """
        if report_id:
            report = self.report_repo.get(report_id)
            if not report:
                raise NotFoundError(f"Report {report_id} not found")
            analyses = self.repo.list_by_report(report_id, limit=limit)
        else:
            analyses = self.repo.list_recent(limit=limit)
        return [self._to_dict(analysis) for analysis in analyses]

    # ── Internals ───────────────────────────────────────────────────────────────

    def _to_dict(self, analysis: AIAnalysis) -> dict:
        """Flatten an AIAnalysis + its Report into a rich response dict."""
        report = self.report_repo.get(analysis.report_id) if analysis.report_id else None
        metadata = analysis.analysis_metadata or {}
        cost_breakdown = metadata.get("cost_breakdown") or {}

        return {
            "analysis_id": analysis.id,
            "report_id": analysis.report_id,
            "report_number": report.report_number if report else None,
            "road_name": report.road_name if report else None,
            "address": report.address if report else None,
            "image_path": report.image_path if report else None,
            "model_version": analysis.model_version or MOCK_MODEL_VERSION,
            "analysis_status": analysis.analysis_status.value if analysis.analysis_status else "completed",
            "processing_time_ms": analysis.processing_time_ms,
            "damage_type": analysis.damage_type.value if analysis.damage_type else None,
            "severity": analysis.severity.value if analysis.severity else None,
            "confidence": analysis.confidence_score,
            "confidence_level": analysis.confidence_level.value if analysis.confidence_level else None,
            "risk_score": analysis.risk_score,
            "overall_damage_score": analysis.overall_damage_score,
            "road_condition": metadata.get("road_condition"),
            "estimated_repair_cost": (
                float(analysis.repair_cost) if analysis.repair_cost is not None else None
            ),
            "repair_method": metadata.get("repair_method"),
            "priority": metadata.get("priority"),
            "summary": analysis.repair_recommendation or analysis.description,
            "detections": analysis.detections or [],
            "bounding_boxes": analysis.bounding_boxes or [],
            "cost_breakdown": cost_breakdown,
            "equipment": metadata.get("equipment") or [],
            "notes": metadata.get("notes"),
            "expected_duration_days": metadata.get("expected_duration_days"),
            "completed_at": analysis.completed_at.isoformat() if analysis.completed_at else None,
        }

    def _build_record(self, result: dict, report_id: str) -> AIAnalysis:
        """Build an AIAnalysis ORM object from a mock-analysis result dict."""
        damage = result.get("damage_type")
        severity_label = result.get("severity")
        confidence = float(result.get("confidence") or 0.0)
        cost = result.get("estimated_repair_cost")

        return AIAnalysis(
            report_id=report_id,
            model_version=result.get("model_version") or MOCK_MODEL_VERSION,
            analysis_status=AnalysisStatus.COMPLETED,
            processing_time_ms=45,
            damage_type=DamageType(damage) if damage else None,
            severity=SeverityLevel(severity_label) if severity_label else None,
            confidence_score=confidence,
            confidence_level=_confidence_level(confidence),
            risk_score=float(result.get("risk_score") or 72.5),
            overall_damage_score=float(result.get("overall_damage_score") or 72.5),
            description=result.get("summary"),
            repair_cost=cost,
            repair_recommendation=result.get("summary"),
            detections=result.get("detections"),
            bounding_boxes=result.get("bounding_boxes"),
            analysis_metadata={
                "repair_method": result.get("repair_method"),
                "priority": result.get("priority"),
                "expected_duration_days": result.get("expected_duration_days"),
                "equipment": result.get("equipment"),
                "notes": result.get("notes"),
                "cost_breakdown": result.get("cost_breakdown"),
                "road_condition": result.get("road_condition"),
            },
            completed_at=datetime.now(timezone.utc),
        )

    def _update_report(self, report: Report, result: dict) -> None:
        """Backfill AI-derived fields onto the Report entity."""
        severity_label = result.get("severity")
        damage = result.get("damage_type")

        report.ai_processed = True
        report.image_path = report.image_path or result.get("image_path")

        if severity_label:
            report.severity = SeverityLevel(severity_label)
        if damage:
            report.damage_type = DamageType(damage)
        if result.get("confidence"):
            report.confidence = round(float(result["confidence"]), 4)
        if result.get("estimated_repair_cost"):
            report.estimated_repair_cost = result["estimated_repair_cost"]

