"""
Inspection statistics service — Milestone: Inspection History & Analytics.

Aggregates dashboard statistics from **real stored inspection data**
(``ai_analyses`` rows + their ``detections`` JSON payloads).

The YOLO model classifies the following damage categories:
    alligator_crack, lane_line_blur, longitudinal_crack, manhole_cover,
    patchy_road_section, pothole, transverse_crack

Aggregation happens in Python for SQLite/PostgreSQL portability, following the
existing ``stats_service`` conventions.
"""

from typing import Dict, List, Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.ai_analysis import AIAnalysis
from app.models.enums import AnalysisStatus
from app.models.report import Report

_COMPLETED = AnalysisStatus.COMPLETED

# Canonical YOLO damage labels (matched against ``detections[].label``).
POTHOLE = "pothole"
ALLIGATOR_CRACK = "alligator_crack"
LONGITUDINAL_CRACK = "longitudinal_crack"
TRANSVERSE_CRACK = "transverse_crack"
LANE_LINE_BLUR = "lane_line_blur"
MANHOLE_COVER = "manhole_cover"
PATCHY_ROAD_SECTION = "patchy_road_section"

# Labels that count as "cracks" for the crack statistic.
# "crack" is a legacy label emitted by the mock pipeline.
_CRACK_LABELS = {ALLIGATOR_CRACK, LONGITUDINAL_CRACK, TRANSVERSE_CRACK, "crack"}

# Display labels for the damage breakdown chart.
DAMAGE_BREAKDOWN_LABELS: Dict[str, str] = {
    POTHOLE: "Pothole",
    ALLIGATOR_CRACK: "Alligator Crack",
    LONGITUDINAL_CRACK: "Longitudinal Crack",
    TRANSVERSE_CRACK: "Transverse Crack",
    LANE_LINE_BLUR: "Lane Line Blur",
    MANHOLE_COVER: "Manhole Cover",
    PATCHY_ROAD_SECTION: "Patchy Road Section",
}

# Priority values used by the recommender / pipeline.
PRIORITY_URGENT = "urgent"
PRIORITY_CRITICAL = "critical"
PRIORITY_HIGH = "high"
PRIORITY_MEDIUM = "medium"
PRIORITY_LOW = "low"


def _all_completed_analyses(db: Session) -> List[AIAnalysis]:
    """Return all completed AI analyses (each row = one inspection)."""
    stmt = select(AIAnalysis).where(AIAnalysis.analysis_status == _COMPLETED)
    return list(db.scalars(stmt).all())


def _analysis_priority(analysis: AIAnalysis) -> Optional[str]:
    """Read the persisted priority from analysis_metadata, if present."""
    metadata = analysis.analysis_metadata or {}
    priority = metadata.get("priority")
    return str(priority).lower() if priority else None


def _iter_detection_labels(analysis: AIAnalysis):
    """Yield the label of every detection stored on an analysis."""
    for det in analysis.detections or []:
        label = (det.get("label") or "").lower()
        if label:
            yield label


def compute_dashboard_stats(db: Session) -> dict:
    """
    Compute all dashboard statistics from real stored inspection data.

    Returns:
        {
          total_inspections,
          total_detected_damages,
          total_potholes,
          total_cracks,
          high_priority,
          medium_priority,
          low_priority,
          estimated_total_repair_cost,
        }
    """
    analyses = _all_completed_analyses(db)

    total_inspections = len(analyses)

    total_detected_damages = 0
    total_potholes = 0
    total_cracks = 0

    for analysis in analyses:
        labels = list(_iter_detection_labels(analysis))
        total_detected_damages += len(labels)
        total_potholes += sum(1 for label in labels if label == POTHOLE)
        total_cracks += sum(1 for label in labels if label in _CRACK_LABELS)

    # Primary damage type fallback: an analysis with no raw detections (or
    # empty detections) still flags a primary damage_type.
    for analysis in analyses:
        if not (analysis.detections or []):
            primary = (analysis.damage_type.value if analysis.damage_type else "") or ""
            primary = primary.lower()
            if primary == POTHOLE:
                total_potholes += 1
            elif primary in {ALLIGATOR_CRACK, LONGITUDINAL_CRACK, TRANSVERSE_CRACK, "crack"}:
                total_cracks += 1

    # Priority buckets from stored metadata (falls back to severity mapping).
    high_priority = 0
    medium_priority = 0
    low_priority = 0
    for analysis in analyses:
        priority = _analysis_priority(analysis)
        if priority in {PRIORITY_URGENT, PRIORITY_CRITICAL, PRIORITY_HIGH}:
            high_priority += 1
        elif priority in {PRIORITY_MEDIUM}:
            medium_priority += 1
        elif priority in {PRIORITY_LOW}:
            low_priority += 1
        else:
            # Fallback: derive from the persisted severity.
            severity = analysis.severity.value.lower() if analysis.severity else ""
            if severity in {"high", "critical"}:
                high_priority += 1
            elif severity == "medium":
                medium_priority += 1
            elif severity == "low":
                low_priority += 1

    estimated_total_repair_cost = 0.0
    for analysis in analyses:
        if analysis.repair_cost is not None:
            estimated_total_repair_cost += float(analysis.repair_cost)

    return {
        "total_inspections": total_inspections,
        "total_detected_damages": total_detected_damages,
        "total_potholes": total_potholes,
        "total_cracks": total_cracks,
        "high_priority": high_priority,
        "medium_priority": medium_priority,
        "low_priority": low_priority,
        "estimated_total_repair_cost": round(estimated_total_repair_cost, 2),
    }


def compute_damage_breakdown(db: Session) -> list:
    """
    Count detected damages per YOLO damage category from stored detections.

    Returns:
        [{"name": "Pothole", "value": N}, ...] sorted descending.
    """
    counts: Dict[str, int] = {label: 0 for label in DAMAGE_BREAKDOWN_LABELS}

    for analysis in _all_completed_analyses(db):
        for label in _iter_detection_labels(analysis):
            # Map legacy labels (e.g. "crack", "alligator_cracks") to canonical.
            canonical = _legacy_to_canonical(label) or label
            if canonical in counts:
                counts[canonical] += 1

    # Fallback: analyses without raw detections contribute their primary type.
    for analysis in _all_completed_analyses(db):
        if not (analysis.detections or []):
            primary = (analysis.damage_type.value if analysis.damage_type else "") or ""
            primary = primary.lower()
            # Map legacy enum values (e.g. alligator_cracks, crack) to canonical.
            canonical = _legacy_to_canonical(primary)
            if canonical in counts:
                counts[canonical] += 1

    return [
        {"name": DAMAGE_BREAKDOWN_LABELS[label], "value": count}
        for label, count in sorted(counts.items(), key=lambda item: item[1], reverse=True)
    ]


def list_recent_inspections(db: Session, limit: int = 10) -> list:
    """
    Return the most recent inspections (AIAnalysis rows) with report context.

    Each item includes: analysis id, report id/number, road name, date,
    damage type, severity, priority, confidence, cost. Used by the dashboard's
    "Recent Inspections" section.
    """
    stmt = (
        select(AIAnalysis)
        .where(AIAnalysis.analysis_status == _COMPLETED)
        .order_by(AIAnalysis.completed_at.desc())
        .limit(limit)
    )
    analyses = list(db.scalars(stmt).all())

    items = []
    for analysis in analyses:
        report = db.get(Report, analysis.report_id) if analysis.report_id else None
        metadata = analysis.analysis_metadata or {}
        priority = metadata.get("priority")
        items.append(
            {
                "analysis_id": analysis.id,
                "report_id": analysis.report_id,
                "report_number": report.report_number if report else None,
                "road_name": report.road_name if report else None,
                "image_path": (
                    metadata.get("image_path") or (report.image_path if report else None)
                ),
                "inspection_date": (
                    analysis.completed_at.isoformat() if analysis.completed_at else None
                ),
                "damage_type": analysis.damage_type.value if analysis.damage_type else None,
                "severity": analysis.severity.value if analysis.severity else None,
                "priority": priority,
                "confidence": analysis.confidence_score,
                "estimated_repair_cost": (
                    float(analysis.repair_cost) if analysis.repair_cost is not None else None
                ),
                "recommendation": analysis.repair_recommendation,
            }
        )
    return items


def list_map_inspections(db: Session, limit: int = 500) -> list:
    """
    Return inspections that have GPS coordinates for map visualization.

    Only completed AI analyses whose linked Report carries latitude/longitude
    are returned. Exposes only data required for road-damage visualization
    (no user/private information).

    Each item:
        {
          id, report_id, report_number, road_name,
          latitude, longitude,
          damage_type, severity, priority,
          confidence, estimated_cost, inspection_date,
        }
    """
    stmt = (
        select(AIAnalysis)
        .where(AIAnalysis.analysis_status == _COMPLETED)
        .order_by(AIAnalysis.completed_at.desc())
        .limit(limit)
    )
    analyses = list(db.scalars(stmt).all())

    items = []
    for analysis in analyses:
        report = db.get(Report, analysis.report_id) if analysis.report_id else None
        if report is None or report.latitude is None or report.longitude is None:
            continue

        metadata = analysis.analysis_metadata or {}
        items.append(
            {
                "id": analysis.id,
                "report_id": analysis.report_id,
                "report_number": report.report_number,
                "road_name": report.road_name,
                "latitude": float(report.latitude),
                "longitude": float(report.longitude),
                "damage_type": analysis.damage_type.value if analysis.damage_type else None,
                "severity": analysis.severity.value if analysis.severity else None,
                "priority": metadata.get("priority"),
                "confidence": analysis.confidence_score,
                "estimated_cost": (
                    float(analysis.repair_cost) if analysis.repair_cost is not None else None
                ),
                "inspection_date": (
                    analysis.completed_at.isoformat() if analysis.completed_at else None
                ),
            }
        )
    return items


def _legacy_to_canonical(label: str) -> Optional[str]:
    """Map a legacy DamageType enum value to a canonical YOLO label."""
    mapping = {
        "potholes": POTHOLE,
        "pothole": POTHOLE,
        "alligator_cracks": ALLIGATOR_CRACK,
        "alligator_crack": ALLIGATOR_CRACK,
        "cracks": LONGITUDINAL_CRACK,
        "crack": LONGITUDINAL_CRACK,
        "surface_wear": PATCHY_ROAD_SECTION,
        "other": None,
    }
    return mapping.get((label or "").lower())
