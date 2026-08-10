"""
Database base module.

Importing this module registers all ORM models with the Base metadata so that
Alembic autogenerate and `Base.metadata.create_all()` see every table.
"""

from app.db.session import Base  # noqa: F401  (re-exported for Alembic env.py)

# Import models so they are registered on Base.metadata.
from app.models.ai_analysis import AIAnalysis  # noqa: F401
from app.models.repair_recommendation import RepairRecommendation  # noqa: F401
from app.models.report import Report  # noqa: F401
from app.models.user import User  # noqa: F401

__all__ = ["Base", "User", "Report", "AIAnalysis", "RepairRecommendation"]

