"""
Image preprocessing helpers for the YOLOv8 pipeline.

This is the **official preprocessing module** for the real AI pipeline (Phase 13).
It is referenced by :mod:`app.ai.pipeline` and the model manager. No duplicate
``preprocess.py`` is maintained — ``preprocessing.py`` is the single source of
truth for image decoding and preparation.

Responsibilities (Milestone 2):
    - Resolve an ``image_path`` that may be one of:
        * relative storage path  (``uploads/abc.jpg``)
        * public static URL      (``/uploads/abc.jpg``)
        * absolute filesystem path
    - Validate the file exists, is non-empty, and decodes to a valid image.
    - Fix EXIF orientation (via Pillow) so camera-phone uploads are upright.
    - Return a BGR ``numpy.ndarray`` ready for OpenCV drawing and the YOLO model.

Raises :class:`app.core.exceptions.ValidationError` (404/422) for missing or
corrupt images. Import-safe scaffold only — heavy deps (``cv2`` / ``PIL`` /
``numpy``) are imported lazily inside the functions so the app always boots.
Full implementation lands in Milestone 3.
"""

from __future__ import annotations

from typing import Any, Dict, Optional


def resolve_image_path(image_path: str) -> str:
    """
    Resolve a stored/static/absolute image reference to an absolute filesystem path.

    Args:
        image_path: Storage-relative (``uploads/x.jpg``), static URL
            (``/uploads/x.jpg``), or absolute path.

    Returns:
        Absolute path to the image file.

    Raises:
        ValidationError: if the image cannot be located or does not exist.
    """
    raise NotImplementedError("Implemented in Milestone 2.")


def load_image_bytes(image_path: str) -> bytes:
    """Read raw image bytes from disk (raises for missing files)."""
    raise NotImplementedError("Implemented in Milestone 2.")


def decode_image(image_path: str) -> Any:
    """
    Decode an image into a BGR ndarray, applying EXIF orientation.

    Returns:
        A BGR np.ndarray (original resolution — never downscaled here).
    """
    raise NotImplementedError("Implemented in Milestone 2.")


def image_metadata(image_path: str) -> Dict[str, Any]:
    """Return original width, height, and filename for box denormalization."""
    return {}

