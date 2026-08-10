"""
Standard API response models.

All endpoints return a consistent envelope:
  { "success": true, "data": ..., "meta": ... }   (success)
  { "success": false, "error": { ... } }          (error — see exceptions.py)
"""

from typing import Any, Dict, Generic, Optional, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class Meta(BaseModel):
    """Optional pagination / metadata attached to list responses."""

    page: Optional[int] = None
    page_size: Optional[int] = None
    total: Optional[int] = None
    total_pages: Optional[int] = None
    has_next: Optional[bool] = None
    has_prev: Optional[bool] = None


class ApiResponse(BaseModel, Generic[T]):
    """Standard success response envelope."""

    success: bool = True
    data: Optional[T] = None
    meta: Optional[Meta] = None


class ErrorDetail(BaseModel):
    """Structure of a single validation/error detail item."""

    field: Optional[str] = None
    message: str
    type: Optional[str] = None


class ErrorPayload(BaseModel):
    """Structure of the error object inside an error envelope."""

    code: str
    message: str
    status_code: int
    details: Optional[Any] = None


class ErrorResponse(BaseModel):
    """Standard error response envelope (matches exceptions._error_body)."""

    success: bool = False
    error: ErrorPayload


def ok_response(data: Any = None, meta: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Convenience helper to build a success envelope dict."""
    return {"success": True, "data": data, "meta": meta or None}


def ok_list_response(
    items: list,
    total: int,
    page: Optional[int] = None,
    page_size: Optional[int] = None,
) -> Dict[str, Any]:
    """Convenience helper to build a paginated success envelope dict."""
    total_pages = None
    if page_size and page_size > 0:
        import math

        total_pages = math.ceil(total / page_size)

    meta = Meta(
        page=page,
        page_size=page_size,
        total=total,
        total_pages=total_pages,
        has_next=bool(page and page_size and page < total_pages) if total_pages else None,
        has_prev=bool(page and page > 1),
    )
    return {"success": True, "data": items, "meta": meta}

