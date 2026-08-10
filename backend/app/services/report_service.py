"""
Report service — business logic for the Report CRUD endpoints.

This layer orchestrates the repository, handles report-number generation,
applies update rules (e.g. resolved_at on RESOLVED status), and raises the
domain exceptions defined in `core/exceptions.py`.

Deliberately does NOT contain AI logic — the YOLOv8 pipeline (Milestone 3)
will populate AI fields through this service in a later milestone.
"""

from typing import Optional

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.core.logging import get_logger
from app.models.enums import ReportStatus
from app.models.report import Report
from app.repositories.report_repository import ReportRepository
from app.schemas.report import ReportCreate, ReportReplace, ReportUpdate
from app.utils.helpers import generate_report_number, utcnow

logger = get_logger(__name__)


class ReportService:
    """Encapsulates all report business operations."""

    def __init__(self, db: Session) -> None:
        self.db = db
        self.repo = ReportRepository(db)

    # ── Queries ─────────────────────────────────────────────────────────────────

    def list_reports(
        self,
        status: Optional[str] = None,
        severity: Optional[str] = None,
        road_name: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> dict:
        """Return a paginated, filtered list of reports with totals."""
        total = self.repo.count_filtered(status=status, severity=severity, road_name=road_name)
        items = self.repo.list_filtered(
            status=status,
            severity=severity,
            road_name=road_name,
            page=page,
            page_size=page_size,
        )
        return {"items": items, "total": total}

    def get_report(self, report_id: str) -> Report:
        """Fetch a single report by ID or raise NotFoundError."""
        report = self.repo.get(report_id)
        if not report:
            raise NotFoundError(f"Report {report_id} not found")
        return report

    def get_report_by_number(self, report_number: str) -> Report:
        """Fetch a single report by report number or raise NotFoundError."""
        report = self.repo.get_by_report_number(report_number)
        if not report:
            raise NotFoundError(f"Report {report_number} not found")
        return report

    # ── Mutations ───────────────────────────────────────────────────────────────

    def create_report(self, payload: ReportCreate) -> Report:
        """
        Create a new report.

        Generates a human-readable report number (RS-YYYY-NNNNNN) using the
        current year's max sequence + 1, then persists the report.
        """
        year = utcnow().year
        max_seq = self.repo.get_max_sequence_for_year(year)
        report_number = generate_report_number(max_seq)

        report = Report(
            report_number=report_number,
            user_id=payload.user_id,
            road_name=payload.road_name,
            description=payload.description,
            road_type=payload.road_type,
            address=payload.address,
            latitude=payload.latitude,
            longitude=payload.longitude,
            status=ReportStatus.SUBMITTED,
            image_path=payload.image_path,
            severity=payload.severity,
            damage_type=payload.damage_type,
            priority=payload.priority,
        )
        self.repo.save(report)
        logger.info("Created report %s (%s)", report.id, report.report_number)
        return report

    def update_report(self, report_id: str, payload: ReportUpdate) -> Report:
        """Partially update a report's mutable fields."""
        report = self.get_report(report_id)

        updates = payload.model_dump(exclude_unset=True)
        for field, value in updates.items():
            setattr(report, field, value)

        self.repo.save(report)
        logger.info("Updated report %s", report.id)
        return report

    def replace_report(self, report_id: str, payload: ReportReplace) -> Report:
        """
        Fully replace a report's mutable fields (PUT semantics).

        Unlike PATCH, every mutable field is overwritten with the supplied
        values. The report id, report_number, status, timestamps, and AI
        analysis fields are preserved.
        """
        report = self.get_report(report_id)

        report.road_name = payload.road_name
        report.description = payload.description
        report.road_type = payload.road_type
        report.address = payload.address
        report.latitude = payload.latitude
        report.longitude = payload.longitude
        report.image_path = payload.image_path
        report.severity = payload.severity
        report.damage_type = payload.damage_type
        report.priority = payload.priority

        self.repo.save(report)
        logger.info("Replaced report %s", report.id)
        return report

    def update_status(self, report_id: str, new_status: ReportStatus) -> Report:
        """Transition a report to a new lifecycle status."""
        report = self.get_report(report_id)
        report.status = new_status

        if new_status == ReportStatus.RESOLVED and report.resolved_at is None:
            report.resolved_at = utcnow()
        elif new_status != ReportStatus.RESOLVED:
            report.resolved_at = None

        self.repo.save(report)
        logger.info("Report %s status → %s", report.id, new_status.value)
        return report

    def delete_report(self, report_id: str) -> None:
        """Delete a report, raising NotFoundError if it does not exist."""
        report = self.get_report(report_id)
        self.repo.delete(report)
        logger.info("Deleted report %s", report.id)

