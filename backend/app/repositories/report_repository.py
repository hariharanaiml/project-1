"""
Report repository.

Extends the generic `BaseRepository` with report-specific queries: filtering
by status/severity, pagination, counting, and finding the current year's
maximum sequence for report-number generation.

Kept intentionally thin — business rules live in `services/report_service.py`.
"""

from typing import Optional

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.enums import ReportStatus, SeverityLevel
from app.models.report import Report
from app.repositories.base import BaseRepository


class ReportRepository(BaseRepository[Report]):
    """Data-access operations specific to the Report model."""

    def __init__(self, db: Session) -> None:
        super().__init__(db, Report)

    def list_filtered(
        self,
        status: Optional[str] = None,
        severity: Optional[str] = None,
        road_name: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> list[Report]:
        """
        Return a page of reports, optionally filtered.

        Filters are applied as SQLAlchemy WHERE clauses against the ORM
        model's enum columns. The `status`/`severity` strings are matched
        against the enum *values* (e.g. "in-review"), which is portable
        across SQLite and PostgreSQL.
        """
        stmt = select(Report)

        if status:
            stmt = stmt.where(Report.status == status)
        if severity:
            stmt = stmt.where(Report.severity == severity)
        if road_name:
            # Case-insensitive substring search is portable across DBs.
            stmt = stmt.where(Report.road_name.ilike(f"%{road_name}%"))

        stmt = stmt.order_by(Report.submitted_date.desc())
        stmt = stmt.offset((page - 1) * page_size).limit(page_size)

        return list(self.db.scalars(stmt).all())

    def count_filtered(
        self,
        status: Optional[str] = None,
        severity: Optional[str] = None,
        road_name: Optional[str] = None,
    ) -> int:
        """Count reports matching the same filters as `list_filtered`."""
        stmt = select(func.count()).select_from(Report)

        if status:
            stmt = stmt.where(Report.status == status)
        if severity:
            stmt = stmt.where(Report.severity == severity)
        if road_name:
            stmt = stmt.where(Report.road_name.ilike(f"%{road_name}%"))

        return int(self.db.scalars(stmt).one())

    def get_max_sequence_for_year(self, year: int) -> int:
        """
        Return the highest report-number sequence for a given year.

        Report numbers look like `RS-2026-000001`; this extracts the numeric
        suffix and returns its maximum (0 when no reports exist for the year).
        """
        prefix = f"RS-{year}-%"
        stmt = select(Report.report_number).where(Report.report_number.like(prefix))
        report_numbers = self.db.scalars(stmt).all()

        max_seq = 0
        for number in report_numbers:
            try:
                seq = int(number.rsplit("-", 1)[1])
                max_seq = max(max_seq, seq)
            except (IndexError, ValueError):
                continue
        return max_seq

    def get_by_report_number(self, report_number: str) -> Optional[Report]:
        """Fetch a single report by its human-readable report number."""
        return self.get_by_field("report_number", report_number)

