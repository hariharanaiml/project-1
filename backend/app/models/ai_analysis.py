"""
AIAnalysis ORM model.

Stores the output of the AI damage-detection pipeline for a single report.
The YOLOv8 model integration lands in a later milestone — this schema is the
contract that pipeline will write into.
"""

import uuid
from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from sqlalchemy import JSON, DateTime, Enum, Float, ForeignKey, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.enums import AIConfidenceLevel, AnalysisStatus, DamageType, SeverityLevel


class AIAnalysis(Base):
    """AI detection/classification output for one report."""

    __tablename__ = "ai_analyses"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    report_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("reports.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # ── Pipeline metadata ────────────────────────────────────────────────────────
    model_version: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    analysis_status: Mapped[AnalysisStatus] = mapped_column(
        Enum(AnalysisStatus, name="analysis_status", native_enum=False, validate_strings=True),
        default=AnalysisStatus.PENDING,
        nullable=False,
    )
    processing_time_ms: Mapped[Optional[int]] = mapped_column(nullable=True)

    # ── Primary detection result ────────────────────────────────────────────────
    damage_type: Mapped[Optional[DamageType]] = mapped_column(
        Enum(DamageType, name="analysis_damage_type", native_enum=False, validate_strings=True),
        nullable=True,
    )
    severity: Mapped[Optional[SeverityLevel]] = mapped_column(
        Enum(SeverityLevel, name="analysis_severity", native_enum=False, validate_strings=True),
        nullable=True,
    )
    confidence_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    confidence_level: Mapped[Optional[AIConfidenceLevel]] = mapped_column(
        Enum(
            AIConfidenceLevel,
            name="analysis_confidence_level",
            native_enum=False,
            validate_strings=True,
        ),
        nullable=True,
    )
    risk_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    overall_damage_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # ── Repair estimates (Milestone 5) ──────────────────────────────────────────
    repair_cost: Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 2), nullable=True)
    repair_recommendation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # ── Raw outputs ──────────────────────────────────────────────────────────────
    # JSON columns are fully portable across SQLite and PostgreSQL.
    # NOTE: named `analysis_metadata` because `metadata` is reserved by the
    # SQLAlchemy Declarative API.
    detections: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    bounding_boxes: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    analysis_metadata: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # ── Timestamps ──────────────────────────────────────────────────────────────
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # ── Relationships ───────────────────────────────────────────────────────────
    report: Mapped["Report"] = relationship(back_populates="ai_analysis")  # noqa: F821

    def __repr__(self) -> str:
        return f"<AIAnalysis id={self.id} report={self.report_id} status={self.analysis_status.value}>"

