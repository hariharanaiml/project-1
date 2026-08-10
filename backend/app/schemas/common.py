"""Common/shared Pydantic schemas used across multiple API modules."""

from datetime import datetime
from typing import Generic, Optional, TypeVar

from pydantic import BaseModel, ConfigDict, Field

T = TypeVar("T")


class ORMModel(BaseModel):
    """Base schema with ORM mode enabled (Pydantic v2)."""

    model_config = ConfigDict(from_attributes=True)


class PaginationParams(BaseModel):
    """Common pagination query parameters."""

    page: int = Field(default=1, ge=1, description="Page number (1-indexed)")
    page_size: int = Field(default=20, ge=1, le=100, description="Items per page")


class MetaResponse(BaseModel):
    """Pagination metadata attached to list responses."""

    page: Optional[int] = None
    page_size: Optional[int] = None
    total: int = 0
    total_pages: Optional[int] = None
    has_next: Optional[bool] = None
    has_prev: Optional[bool] = None


class ApiResponse(BaseModel, Generic[T]):
    """Standard success response envelope."""

    success: bool = True
    data: Optional[T] = None
    meta: Optional[MetaResponse] = None


class TimestampedSchema(ORMModel):
    """Common timestamp fields."""

    created_at: datetime
    updated_at: datetime

