"""
Report ORM model.

Represents a road-damage report submitted through the platform. Contains both
user-provided metadata and AI-generated analysis fields. AI fields remain
nullable until the YOLOv8 pipeline lands in a later milestone.
"""

import uuid
from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from sqlalchemy import (
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.enums import (
    DamageType,
    PriorityLevel,
    ReportStatus,
    RoadType,
    SeverityLevel,
)


class Report(Base):
    """A single road damage report."""

    __tablename__ = "reports"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    # Human-readable report number, e.g. RS-2026-000001
    report_number: Mapped[str] = mapped_column(
        String(32), unique=True, index=True, nullable=False
    )

    # ── User relationship ───────────────────────────────────────────────────────
    user_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )

    # ── User-provided metadata ───────────────────────────────────────────────────
    road_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    road_type: Mapped[Optional[RoadType]] = mapped_column(
        Enum(RoadType, name="road_type", native_enum=False, validate_strings=True), nullable=True
    )
    address: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # ── Status / severity ───────────────────────────────────────────────────────
    status: Mapped[ReportStatus] = mapped_column(
        Enum(ReportStatus, name="report_status", native_enum=False, validate_strings=True),
        default=ReportStatus.SUBMITTED,
        nullable=False,
        index=True,
    )
    severity: Mapped[Optional[SeverityLevel]] = mapped_column(
        Enum(SeverityLevel, name="severity_level", native_enum=False, validate_strings=True),
        nullable=True,
        index=True,
    )
    damage_type: Mapped[Optional[DamageType]] = mapped_column(
        Enum(DamageType, name="damage_type", native_enum=False, validate_strings=True),
        nullable=True,
        index=True,
    )
    priority: Mapped[Optional[PriorityLevel]] = mapped_column(
        Enum(PriorityLevel, name="priority_level", native_enum=False, validate_strings=True),
        nullable=True,
    )

    # ── AI-analyzed fields (filled when AI pipeline runs — later milestone) ─────
    image_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    ai_processed: Mapped[bool] = mapped_column(default=False, nullable=False)
    confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    estimated_repair_cost: Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 2), nullable=True)

    # ── Timestamps ──────────────────────────────────────────────────────────────
    submitted_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # ── Relationships ───────────────────────────────────────────────────────────
    user: Mapped[Optional["User"]] = relationship(back_populates="reports")  # noqa: F821
    ai_analysis: Mapped[List["AIAnalysis"]] = relationship(  # noqa: F821
        back_populates="report", cascade="all, delete-orphan"
    )
    repair_recommendation: Mapped[Optional["RepairRecommendation"]] = relationship(  # noqa: F821
        back_populates="report", uselist=False, cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Report id={self.id} number={self.report_number!r} status={self.status.value}>"

