"""
AIAnalysis repository.

Extends the generic `BaseRepository` with AI-analysis-specific queries:
listing analyses by report, and fetching the latest analysis for a report.
"""

from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.ai_analysis import AIAnalysis
from app.repositories.base import BaseRepository


class AIAnalysisRepository(BaseRepository[AIAnalysis]):
    """Data-access operations specific to the AIAnalysis model."""

    def __init__(self, db: Session) -> None:
        super().__init__(db, AIAnalysis)

    def list_by_report(self, report_id: str, limit: int = 20) -> list[AIAnalysis]:
        """Return the most recent analyses for a report (newest first)."""
        stmt = (
            select(AIAnalysis)
            .where(AIAnalysis.report_id == report_id)
            .order_by(AIAnalysis.created_at.desc())
            .limit(limit)
        )
        return list(self.db.scalars(stmt).all())

    def get_latest_for_report(self, report_id: str) -> Optional[AIAnalysis]:
        """Return the single most recent analysis for a report, if any."""
        stmt = (
            select(AIAnalysis)
            .where(AIAnalysis.report_id == report_id)
            .order_by(AIAnalysis.created_at.desc())
            .limit(1)
        )
        return self.db.scalars(stmt).first()

    def get_latest(self) -> Optional[AIAnalysis]:
        """Return the single most recent analysis across all reports, if any."""
        stmt = select(AIAnalysis).order_by(AIAnalysis.created_at.desc()).limit(1)
        return self.db.scalars(stmt).first()

    def list_recent(self, limit: int = 20) -> list[AIAnalysis]:
        """Return the most recent analyses across all reports (newest first)."""
        stmt = select(AIAnalysis).order_by(AIAnalysis.created_at.desc()).limit(limit)
        return list(self.db.scalars(stmt).all())

