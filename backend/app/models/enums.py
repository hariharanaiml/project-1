"""
Shared enum definitions for ORM models and Pydantic schemas.

Using string-based Python enums keeps the schema fully PostgreSQL compatible
(native ENUMs are avoided so switching databases requires no special handling).
"""

import enum


class UserRole(str, enum.Enum):
    """Platform user roles."""

    CITIZEN = "citizen"
    ENGINEER = "engineer"
    ADMIN = "admin"
    MODERATOR = "moderator"


class UserStatus(str, enum.Enum):
    """User account lifecycle states."""

    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"


class ReportStatus(str, enum.Enum):
    """Lifecycle of a damage report."""

    SUBMITTED = "submitted"
    PENDING = "pending"
    IN_REVIEW = "in-review"
    VERIFIED = "verified"
    RESOLVED = "resolved"
    REJECTED = "rejected"


class DamageType(str, enum.Enum):
    """Detected road damage categories."""

    POTHOLES = "pothole"
    CRACKS = "crack"
    EDGE_FAILURE = "edge_failure"
    SURFACE_WEAR = "surface_wear"
    ALLIGATOR_CRACKS = "alligator_cracks"
    RUTTING = "rutting"
    OTHER = "other"


class SeverityLevel(str, enum.Enum):
    """Damage severity levels."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class PriorityLevel(str, enum.Enum):
    """Repair priority levels."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"
    URGENT = "urgent"


class RoadType(str, enum.Enum):
    """Road classification."""

    HIGHWAY = "highway"
    CITY_ROAD = "city_road"
    VILLAGE_ROAD = "village_road"
    BRIDGE = "bridge"
    OTHER = "other"


class AnalysisStatus(str, enum.Enum):
    """AI analysis lifecycle."""

    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class AIConfidenceLevel(str, enum.Enum):
    """Confidence buckets used by the AI analysis output."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

