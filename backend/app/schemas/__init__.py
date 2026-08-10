"""Pydantic v2 schemas (request/response models)."""

from app.schemas.ai_analysis import (  # noqa: F401
    AIAnalysisCreate,
    AIAnalysisListResponse,
    AIAnalysisRead,
    AIAnalysisUpdate,
    AIResponse,
    AIResponseEnvelope,
    BoundingBoxItem,
    DetectionItem,
)
from app.schemas.upload import FileUpload, FileUploadResponse  # noqa: F401

__all__ = [
    "AIAnalysisCreate",
    "AIAnalysisListResponse",
    "AIAnalysisRead",
    "AIAnalysisUpdate",
    "AIResponse",
    "AIResponseEnvelope",
    "BoundingBoxItem",
    "DetectionItem",
    "FileUpload",
    "FileUploadResponse",
]

