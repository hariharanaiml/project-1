"""
Image upload endpoint — Milestone 4.

Provides `POST /api/v1/upload` (and its unversioned alias `POST /api/upload`)
for storing road-damage photos. The endpoint:

  - accepts JPG / JPEG / PNG only (max 10 MB by default),
  - validates MIME type + size and rejects unsupported files with HTTP 422,
  - stores the file in `backend/uploads/` under a unique UUID filename,
  - returns upload metadata (filename, original filename, timestamp, size,
    mime type) via the `FileUpload` schema.

The handler is defined once and mounted at both prefixes so there is a single
source of truth for upload logic.
"""

from fastapi import APIRouter, File, UploadFile, status

from app.core.responses import ok_response
from app.schemas.upload import FileUpload, FileUploadResponse
from app.utils.upload_utils import process_upload


def _register_upload_routes() -> APIRouter:
    """Build a router with the shared upload handler (used at both prefixes)."""

    router = APIRouter(tags=["Upload"])

    @router.post(
        "/upload",
        summary="Upload an image",
        description=(
            "Accepts JPG / JPEG / PNG images up to 10 MB. Stores the file in "
            "backend/uploads/ under a unique UUID filename and returns its metadata."
        ),
        status_code=status.HTTP_201_CREATED,
        response_model=FileUploadResponse,
    )
    async def upload_image(file: UploadFile = File(..., description="Image file (JPG/JPEG/PNG)")) -> dict:
        """
        Upload a road-damage image.

        Returns:
            Envelope with `FileUpload` metadata:
            filename, original filename, upload timestamp, file size, mime type.
        """
        meta = process_upload(file)
        data = FileUpload(
            filename=meta["stored_name"],
            original_filename=meta["original_name"],
            uploaded_at=meta["uploaded_at"],
            size=meta["size"],
            mime_type=meta["content_type"],
            url=meta["url"],
            path=meta["path"],
        )
        return ok_response(data.model_dump())

    return router


# Primary versioned router (mounted under /api/v1 in app.main).
router = _register_upload_routes()

# Unversioned alias router (mounted under /api for backward compatibility).
alias_router = _register_upload_routes()

