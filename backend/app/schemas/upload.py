"""
Pydantic schemas for the image upload module.

Defines the response contract returned by `POST /api/v1/upload` (and its
unversioned alias `POST /api/upload`) so clients can link the stored file to
a report or display it directly via the static `/uploads` URL prefix.
"""

from datetime import datetime

from pydantic import BaseModel, Field


class FileUpload(BaseModel):
    """
    Metadata returned by the `POST /api/v1/upload` (and `/api/upload`) endpoint.

    Mirrors the Milestone 4 requirement: filename, original filename, upload
    timestamp, file size, and MIME type.
    """

    filename: str = Field(..., description="Generated unique stored filename (UUID)")
    original_filename: str = Field(..., description="Original client-supplied filename")
    uploaded_at: datetime = Field(..., description="Upload timestamp (UTC)")
    size: int = Field(..., description="File size in bytes")
    mime_type: str = Field(..., description="Validated MIME type (e.g. image/jpeg)")
    url: str = Field(..., description="Public URL to access the file")
    path: str = Field(..., description="Relative storage path (e.g. uploads/abc.jpg)")


class FileUploadResponse(BaseModel):
    """Standard success envelope for the FileUpload endpoint."""

    success: bool = True
    data: FileUpload
    meta: dict | None = None
