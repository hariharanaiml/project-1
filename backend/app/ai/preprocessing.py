"""
Image preprocessing helpers — Milestone 3 (full implementation).

Resolves image paths from uploads/ relative paths, static URLs, or absolute
paths; applies EXIF orientation correction; returns a BGR ndarray for YOLO.

Heavy deps (cv2 / PIL / numpy) are imported lazily inside functions so the
app boots even when they are not installed.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, Optional

# Backend root (two levels up from this file: backend/app/ai/ → backend/).
_BACKEND_ROOT = Path(__file__).resolve().parent.parent.parent


def resolve_image_path(image_path: str) -> str:
    """
    Resolve a stored/static/absolute image reference to an absolute filesystem path.

    Handles:
    - Absolute paths       (e.g. ``C:/…/uploads/abc.jpg``)
    - Storage-relative     (e.g. ``uploads/abc.jpg``)
    - Static URL           (e.g. ``/uploads/abc.jpg``)

    Returns:
        Absolute path string.

    Raises:
        FileNotFoundError: if the resolved path does not exist.
    """
    raw = (image_path or "").strip()

    # Try as absolute path first.
    candidate = Path(raw)
    if candidate.is_absolute() and candidate.exists():
        return str(candidate)

    # Strip leading "/" for URL paths.
    if raw.startswith("/"):
        raw = raw[1:]

    candidate = _BACKEND_ROOT / raw
    if candidate.exists():
        return str(candidate)

    # Last resort: try relative to CWD.
    candidate_cwd = Path(raw)
    if candidate_cwd.exists():
        return str(candidate_cwd.resolve())

    raise FileNotFoundError(
        f"Image not found: {image_path!r} "
        f"(also tried {_BACKEND_ROOT / raw})"
    )


def load_image_bytes(image_path: str) -> bytes:
    """Read raw image bytes from disk (raises FileNotFoundError for missing files)."""
    resolved = resolve_image_path(image_path)
    with open(resolved, "rb") as fh:
        return fh.read()


def decode_image(image_path: str) -> Any:
    """
    Decode an image file into a BGR numpy ndarray, applying EXIF orientation.

    Args:
        image_path: Storage-relative, URL, or absolute path.

    Returns:
        BGR ndarray (original resolution, never downscaled here).

    Raises:
        ValueError: if the image cannot be decoded.
        FileNotFoundError: if the path cannot be resolved.
    """
    resolved = resolve_image_path(image_path)

    try:
        from PIL import Image, ExifTags  # noqa: PLC0415
        import numpy as np              # noqa: PLC0415
        import cv2                      # noqa: PLC0415

        pil_img = Image.open(resolved)

        # Apply EXIF orientation so camera-phone uploads are upright.
        try:
            exif = pil_img._getexif()  # noqa: SLF001
            if exif:
                for tag, value in exif.items():
                    if ExifTags.TAGS.get(tag) == "Orientation":
                        pil_img = _apply_exif_orientation(pil_img, value)
                        break
        except Exception:  # noqa: BLE001 — no EXIF tag is fine
            pass

        pil_img = pil_img.convert("RGB")
        bgr = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
        return bgr

    except ImportError:
        # Fallback: OpenCV only (no EXIF correction).
        import cv2  # noqa: PLC0415
        img = cv2.imread(resolved)
        if img is None:
            raise ValueError(f"cv2.imread failed for: {resolved}")
        return img


def image_metadata(image_path: str) -> Dict[str, Any]:
    """Return original width, height, and filename for box denormalization."""
    try:
        resolved = resolve_image_path(image_path)
        from PIL import Image  # noqa: PLC0415
        with Image.open(resolved) as img:
            w, h = img.size
        return {
            "width": w,
            "height": h,
            "filename": Path(resolved).name,
        }
    except Exception:  # noqa: BLE001
        return {"width": 0, "height": 0, "filename": ""}


# ── EXIF orientation helper ───────────────────────────────────────────────────

def _apply_exif_orientation(img: Any, orientation: int) -> Any:
    """Rotate/flip a PIL image according to EXIF orientation tag value."""
    ops = {
        2: (None, True,  False),   # flip horizontal
        3: (180,  False, False),   # rotate 180°
        4: (None, False, True),    # flip vertical
        5: (90,   True,  False),   # rotate 90° + flip
        6: (270,  False, False),   # rotate 270° (= 90° CW)
        7: (270,  True,  False),   # rotate 270° + flip
        8: (90,   False, False),   # rotate 90°
    }
    if orientation not in ops:
        return img
    angle, flip_h, flip_v = ops[orientation]
    if angle:
        img = img.rotate(angle, expand=True)
    if flip_h:
        from PIL import ImageOps  # noqa: PLC0415
        img = ImageOps.mirror(img)
    if flip_v:
        from PIL import ImageOps  # noqa: PLC0415
        img = ImageOps.flip(img)
    return img
