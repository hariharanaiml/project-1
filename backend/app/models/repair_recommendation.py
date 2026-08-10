"""
RepairRecommendation ORM model.

Holds the recommended repair method, cost breakdown, and safety notes for a
single report. Populated by the AI pipeline in a later milestone.
"""

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import JSON, DateTime, Enum, ForeignKey, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.enums import PriorityLevel


class RepairRecommendation(Base):
    """Recommended repair details for one report."""

    __tablename__ = "repair_recommendations"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    report_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("reports.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # ── Recommendation ──────────────────────────────────────────────────────────
    recommendation: Mapped[str] = mapped_column(Text, nullable=False)
    recommended_method: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    duration: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    priority: Mapped[Optional[PriorityLevel]] = mapped_column(
        Enum(PriorityLevel, name="repair_priority", native_enum=False, validate_strings=True),
        nullable=True,
    )
    expected_response: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    equipment: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    safety_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # ── Cost breakdown ──────────────────────────────────────────────────────────
    material_cost: Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 2), nullable=True)
    labor_cost: Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 2), nullable=True)
    equipment_cost: Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 2), nullable=True)
    total_cost: Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 2), nullable=True)

    # ── Timestamps ──────────────────────────────────────────────────────────────
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # ── Relationships ───────────────────────────────────────────────────────────
    report: Mapped["Report"] = relationship(back_populates="repair_recommendation")  # noqa: F821

    def __repr__(self) -> str:
        return f"<RepairRecommendation id={self.id} report={self.report_id}>"

