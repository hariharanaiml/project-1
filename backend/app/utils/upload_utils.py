"""
Upload utility functions.

Standalone, testable helpers used by the upload endpoints:

- ``validate_image_content()``   — validate file size, MIME, and image bytes.
- ``generate_unique_filename()`` — build a collision-safe UUID filename.
- ``save_uploaded_file()``       — persist bytes to the configured uploads dir.

These mirror the logic in ``FileStorageService`` but are exposed as plain
functions so they can be reused by any route or worker without coupling to
the service class.
"""

import io
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from fastapi import HTTPException, UploadFile, status
from PIL import Image, UnidentifiedImageError

from app.core.config import settings
from app.core.exceptions import ValidationError

# Extension lookup keyed by MIME type (matches the Milestone 4 allow-list).
_EXTENSIONS = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}
_PIL_FORMATS = {
    "JPEG": "image/jpeg",
    "PNG": "image/png",
    "WEBP": "image/webp",
}
_MIME_ALIASES = {"image/jpg": "image/jpeg"}
_GENERIC_MIME_TYPES = {"", "application/octet-stream"}


def validate_image(
    content_type: Optional[str],
    size: int,
    allowed_types: Optional[set] = None,
    max_bytes: Optional[int] = None,
) -> str:
    """
    Validate an uploaded image's MIME type and size.

    Args:
        content_type: MIME type declared by the client (lower-cased).
        size: Number of bytes in the uploaded file.
        allowed_types: Optional set of allowed MIME types (defaults to settings).
        max_bytes: Optional maximum size in bytes (defaults to settings).

    Returns:
        The validated, normalized MIME type.

    Raises:
        ValidationError: if the type is unsupported or the file is empty.
    """
    allowed = allowed_types if allowed_types is not None else settings.allowed_image_types_set
    maximum = max_bytes if max_bytes is not None else settings.max_upload_size_bytes

    mime = (content_type or "").lower().strip()
    mime = _MIME_ALIASES.get(mime, mime)
    if not mime:
        raise ValidationError("Uploaded file is missing a content type.")

    if mime not in allowed:
        raise ValidationError(
            f"Unsupported file type '{mime}'. Allowed: {sorted(allowed)}"
        )

    if size <= 0:
        raise ValidationError("Uploaded file is empty.")

    if size > maximum:
        raise ValidationError(
            f"File too large: {size} bytes exceeds the "
            f"{settings.max_upload_size_mb} MB limit."
        )

    return mime


def validate_image_content(
    contents: bytes,
    content_type: Optional[str],
    max_bytes: Optional[int] = None,
) -> str:
    """Validate image size, declared MIME type, and decodability from its bytes."""
    maximum = max_bytes if max_bytes is not None else settings.max_upload_size_bytes
    if not contents:
        raise ValidationError("Uploaded file is empty.")
    if len(contents) > maximum:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Image exceeds the {settings.max_upload_size_mb} MB upload limit.",
        )

    declared_mime = (content_type or "").lower().strip()
    declared_mime = _MIME_ALIASES.get(declared_mime, declared_mime)
    if (
        declared_mime not in _GENERIC_MIME_TYPES
        and declared_mime not in settings.allowed_image_types_set
    ):
        raise ValidationError(
            f"Unsupported file type '{declared_mime}'. "
            "Allowed types: image/jpeg, image/png, image/webp."
        )

    try:
        with Image.open(io.BytesIO(contents)) as image:
            actual_mime = _PIL_FORMATS.get(image.format or "")
            image.verify()
    except (UnidentifiedImageError, OSError, ValueError, Image.DecompressionBombError) as exc:
        raise ValidationError("The uploaded file is not a valid, readable image.") from exc

    if actual_mime is None:
        raise ValidationError("Unsupported image format. Use JPG, PNG, or WEBP.")
    if actual_mime not in settings.allowed_image_types_set:
        raise ValidationError(
            f"Unsupported image format '{actual_mime}'. "
            "Allowed types: image/jpeg, image/png, image/webp."
        )
    if declared_mime not in _GENERIC_MIME_TYPES and declared_mime != actual_mime:
        raise ValidationError(
            f"Image content is {actual_mime}, but the request declared {declared_mime}."
        )
    return actual_mime


def generate_unique_filename(original_name: Optional[str] = None, mime: Optional[str] = None) -> str:
    """
    Generate a unique stored filename using a random UUID.

    The extension is resolved from the MIME type when possible, otherwise from
    the original filename's suffix (sanitized). Falls back to ``.img``.

    Args:
        original_name: The client-supplied file name (used for extension only).
        mime: The validated MIME type (used to pick a canonical extension).

    Returns:
        e.g. ``d4f2a1c9...a.jpg``
    """
    extension = _EXTENSIONS.get((mime or "").lower())

    if extension is None:
        suffix = Path(original_name or "").suffix.lower()
        if suffix.startswith(".") and suffix[1:].isalnum() and len(suffix) <= 8:
            extension = suffix
        else:
            extension = ".img"

    return f"{uuid.uuid4().hex}{extension}"


def save_uploaded_file(contents: bytes, filename: str, mime: str) -> dict:
    """
    Persist raw bytes into the configured uploads directory.

    Args:
        contents: Raw file bytes to write.
        filename: The unique stored filename (see ``generate_unique_filename``).
        mime: The validated MIME type.

    Returns:
        Metadata dict with ``filename``, ``stored_name``, ``content_type``,
        ``size``, ``path``, ``url``, and ``uploaded_at``.
    """
    upload_dir: Path = settings.upload_dir_path
    destination = upload_dir / filename

    try:
        with destination.open("wb") as buffer:
            buffer.write(contents)
    except OSError as exc:  # pragma: no cover - disk-level failures
        from app.core.logging import get_logger

        get_logger(__name__).exception("Failed to write upload to %s", destination)
        raise ValidationError("Could not store the uploaded file. Please try again.") from exc

    size = len(contents)
    return {
        "filename": filename,
        "stored_name": filename,
        "content_type": mime,
        "size": size,
        "path": f"uploads/{filename}",
        "url": f"{settings.upload_url_prefix}/{filename}",
        "uploaded_at": datetime.now(timezone.utc),
    }


def delete_uploaded_file(filename: str) -> bool:
    """
    Safely delete a stored upload from the configured uploads directory.

    Guards against path traversal by resolving the destination and verifying it
    stays inside the uploads directory. Missing files are treated as an
    idempotent no-op and return ``False``.

    Args:
        filename: Stored filename (as returned by ``generate_unique_filename``).

    Returns:
        ``True`` if the file was removed, ``False`` if it did not exist or the
        deletion was refused/unsafe.
    """
    from app.core.logging import get_logger

    logger = get_logger(__name__)
    upload_dir: Path = settings.upload_dir_path

    try:
        destination = (upload_dir / filename).resolve()
    except (OSError, ValueError) as exc:
        logger.warning("Invalid upload filename %r — refusing to delete", filename, exc_info=exc)
        return False

    # Ensure the resolved path stays inside the uploads directory.
    if destination.parent != upload_dir.resolve():
        logger.warning("Refusing to delete file outside uploads dir: %s", destination)
        return False

    if not destination.is_file():
        return False

    try:
        destination.unlink()
    except OSError as exc:  # pragma: no cover - disk-level failures
        logger.exception("Failed to delete upload %s", destination)
        return False

    logger.info("Deleted upload %s", destination.name)
    return True


def process_upload(file: UploadFile) -> dict:
    """
    Full pipeline: validate → generate filename → save → return metadata.

    Convenience wrapper used by the upload endpoints so the request handlers
    stay thin. Raises ``ValidationError`` on any invalid input.
    """
    original_name = file.filename or "image"
    content_type = (file.content_type or "").lower().strip()

    # Read at most one byte beyond the limit so oversized requests cannot be
    # buffered without bound before validation.
    contents = file.file.read(settings.max_upload_size_bytes + 1)
    mime = validate_image_content(contents, content_type)

    stored_name = generate_unique_filename(original_name, mime)
    meta = save_uploaded_file(contents, stored_name, mime)
    # Expose the client-supplied original filename for the FileUpload schema.
    meta["original_name"] = original_name
    return meta
