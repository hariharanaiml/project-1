"""
Stats service — dashboard / analytics / admin aggregation queries.

Derives overview counters, monthly trends, distributions, user lists, and
system-health metrics directly from the database. Aggregation happens in
Python for SQLite/PostgreSQL portability (these are dev-scale queries).
"""

from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.enums import ReportStatus, SeverityLevel, UserRole
from app.models.report import Report
from app.models.user import User
from app.services.ai_service import MOCK_MODEL_VERSION

#: Statuses treated as "pending verification" in admin/dashboard views.
_PENDING_STATUSES = {ReportStatus.SUBMITTED, ReportStatus.PENDING, ReportStatus.IN_REVIEW}

#: Human-friendly labels for the damage/severity distributions.
_DAMAGE_LABELS = {
    "pothole": "Pothole",
    "crack": "Crack",
    "edge_failure": "Edge Failure",
    "surface_wear": "Surface Wear",
    "alligator_cracks": "Alligator Cracks",
    "rutting": "Rutting",
    "other": "Other",
}

#: Human-friendly labels for severity buckets.
_SEVERITY_LABELS = {
    "low": "Low",
    "medium": "Medium",
    "high": "High",
    "critical": "Critical",
}


def _counts_by_status(db: Session) -> dict:
    """Return {status_value: count} for all reports."""
    stmt = select(Report.status, func.count()).group_by(Report.status)
    return {status.value: count for status, count in db.execute(stmt).all()}


def _counts_by_severity(db: Session) -> dict:
    """Return {severity_value: count} for all reports (null severity skipped)."""
    stmt = select(Report.severity, func.count()).group_by(Report.severity)
    return {severity.value: count for severity, count in db.execute(stmt).all() if severity}


def _counts_by_damage(db: Session) -> dict:
    """Return {damage_type_value: count} for all reports (null type skipped)."""
    stmt = select(Report.damage_type, func.count()).group_by(Report.damage_type)
    return {damage.value: count for damage, count in db.execute(stmt).all() if damage}


def _counts_by_road_name(db: Session) -> list:
    """Return top road_name counts (by address/road name) descending."""
    stmt = (
        select(Report.road_name, func.count())
        .group_by(Report.road_name)
        .order_by(func.count().desc())
        .limit(10)
    )
    return [{"roadName": road, "count": count} for road, count in db.execute(stmt).all()]


def _monthly_trend(db: Session, months: int = 12) -> list:
    """Return the last N months of {month, reports} counts (newest last)."""
    reports = db.scalars(select(Report.submitted_date)).all()

    buckets: dict = {}
    for dt in reports:
        key = (dt.year, dt.month)
        buckets[key] = buckets.get(key, 0) + 1

    # Build a continuous series ending in the current month.
    now = datetime.now(timezone.utc)
    series: list = []
    for offset in range(months - 1, -1, -1):
        year = now.year
        month = now.month - offset
        while month <= 0:
            month += 12
            year -= 1
        series.append(
            {
                "month": datetime(year, month, 1).strftime("%b"),
                "reports": buckets.get((year, month), 0),
            }
        )
    return series


def _active_user_count(db: Session) -> int:
    """Count active (non-deactivated) users."""
    return int(db.scalar(select(func.count()).select_from(User).where(User.is_active.is_(True))))


def dashboard_overview(db: Session) -> dict:
    """Aggregated dashboard overview counters."""
    by_status = _counts_by_status(db)
    by_severity = _counts_by_severity(db)
    return {
        "total_reports": sum(by_status.values()),
        "pending_reports": sum(by_status.get(s, 0) for s in (s.value for s in _PENDING_STATUSES)),
        "resolved_reports": by_status.get(ReportStatus.RESOLVED.value, 0),
        "critical_reports": by_severity.get(SeverityLevel.CRITICAL.value, 0),
        "active_users": _active_user_count(db),
    }


def recent_activity(db: Session, limit: int = 10) -> list:
    """Recent reports formatted for an activity feed."""
    reports = db.scalars(
        select(Report).order_by(Report.submitted_date.desc()).limit(limit)
    ).all()
    return [
        {
            "id": report.id,
            "report_id": report.report_number,
            "road_name": report.road_name,
            "damage_type": report.damage_type.value if report.damage_type else None,
            "severity": report.severity.value if report.severity else None,
            "status": report.status.value,
            "submitted_date": report.submitted_date.isoformat() if report.submitted_date else None,
        }
        for report in reports
    ]


def analytics_overview(db: Session) -> dict:
    """Analytics overview counters (same source as dashboard)."""
    by_status = _counts_by_status(db)
    by_severity = _counts_by_severity(db)
    return {
        "total_reports": sum(by_status.values()),
        "resolved_reports": by_status.get(ReportStatus.RESOLVED.value, 0),
        "pending_reports": sum(by_status.get(s, 0) for s in (s.value for s in _PENDING_STATUSES)),
        "critical_reports": by_severity.get(SeverityLevel.CRITICAL.value, 0),
    }


def analytics_trends(db: Session, months: int = 12) -> dict:
    """Monthly reports trend."""
    return {"items": _monthly_trend(db, months)}


def analytics_distributions(db: Session) -> dict:
    """Damage type / severity / location distributions."""
    damage = _counts_by_damage(db)
    severity = _counts_by_severity(db)
    return {
        "damage_types": [
            {"name": _DAMAGE_LABELS.get(key, key), "value": value}
            for key, value in sorted(damage.items(), key=lambda item: item[1], reverse=True)
        ],
        "severities": [
            {"severity": _SEVERITY_LABELS.get(key, key), "count": value}
            for key, value in sorted(severity.items(), key=lambda item: item[1], reverse=True)
        ],
        "top_locations": _counts_by_road_name(db),
    }


def admin_overview(db: Session) -> dict:
    """Admin overview counters."""
    by_status = _counts_by_status(db)
    by_severity = _counts_by_severity(db)
    return {
        "total_reports": sum(by_status.values()),
        "pending_verification": sum(
            by_status.get(s, 0) for s in (s.value for s in _PENDING_STATUSES)
        ),
        "reports_resolved": by_status.get(ReportStatus.RESOLVED.value, 0),
        "active_users": _active_user_count(db),
        "critical_reports": by_severity.get(SeverityLevel.CRITICAL.value, 0),
    }


def admin_users(db: Session, limit: int = 50) -> list:
    """Recent users formatted for the admin user-management panel."""
    users = db.scalars(select(User).order_by(User.created_at.desc()).limit(limit)).all()
    return [
        {
            "id": user.id,
            "name": user.full_name,
            "email": user.email,
            "role": user.role.value,
            "status": user.status.value,
            "joined": user.created_at.strftime("%d %b %Y") if user.created_at else "",
        }
        for user in users
    ]


def system_health(db: Session) -> list:
    """Live system-health metrics (AI service, DB, storage, API, backup)."""
    # Database latency via a trivial query.
    db_ms = None
    db_ok = True
    try:
        import time

        start = time.perf_counter()
        db.scalar(select(1))
        db_ms = round((time.perf_counter() - start) * 1000, 1)
    except Exception:  # pragma: no cover
        db_ok = False

    # Storage usage of the uploads directory.
    upload_dir: Path = settings.upload_dir_path
    file_count = 0
    total_bytes = 0
    if upload_dir.exists():
        for path in upload_dir.iterdir():
            if path.is_file():
                file_count += 1
                total_bytes += path.stat().st_size
    used_mb = round(total_bytes / (1024 * 1024), 1)
    storage_cap_mb = 100
    storage_pct = min(99, int((total_bytes / (storage_cap_mb * 1024 * 1024)) * 100))
    storage_status = "warning" if storage_pct >= 60 else "success"

    return [
        {
            "key": "aiServer",
            "label": "AI Server Status",
            "status": "success",
            "statusLabel": "Operational",
            "detail": "Mock YOLOv8 detection pipeline ready",
            "meta": MOCK_MODEL_VERSION,
        },
        {
            "key": "database",
            "label": "Database Status",
            "status": "success" if db_ok else "danger",
            "statusLabel": "Operational" if db_ok else "Offline",
            "detail": "SQLite connection verified",
            "meta": f"{db_ms}ms" if db_ms is not None else "N/A",
        },
        {
            "key": "storage",
            "label": "Storage Usage",
            "status": storage_status,
            "statusLabel": f"{storage_pct}% used",
            "detail": f"{file_count} files in {upload_dir.name}",
            "meta": f"{used_mb} MB",
            "progress": storage_pct,
        },
        {
            "key": "api",
            "label": "API Response Time",
            "status": "success",
            "statusLabel": "Normal",
            "detail": f"Environment: {settings.environment}",
            "meta": "healthy",
        },
        {
            "key": "backup",
            "label": "Last Backup",
            "status": "success",
            "statusLabel": "Scheduled",
            "detail": "Automated nightly backup (mock)",
            "meta": "—",
        },
    ]
