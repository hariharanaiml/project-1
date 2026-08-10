"""
Annotated image generation.

Responsibilities (Milestone 3):
    - Draw YOLO-style bounding boxes + label chips (``label conf%``) onto the
      *original-resolution* image using OpenCV.
    - Color per damage type, mirroring the frontend ``TONE_BY_LABEL`` map
      (pothole=red, crack=amber, surface_wear=green, ...).
    - Save as a high-quality JPEG into ``settings.annotated_dir_path`` under a
      unique filename (``{analysis_id}.jpg``).
    - Return the stored path + public URL.

Scaffold only — full implementation lands in Milestone 3.
"""

from __future__ import annotations

from typing import Any, Dict


# BGR colors keyed by DamageType label (mirrors frontend TONE_BY_LABEL).
LABEL_COLORS: Dict[str, tuple] = {
    "pothole": (0, 0, 220),          # red
    "crack": (0, 160, 255),          # amber
    "edge_failure": (0, 0, 220),     # red
    "surface_wear": (0, 180, 60),    # green
    "alligator_cracks": (200, 160, 0),  # teal/info
    "rutting": (0, 160, 255),        # amber
    "other": (255, 120, 0),          # primary blue
}


def annotate_image(image: Any, detections: list, output_filename: str) -> Dict[str, Any]:
    """
    Draw detection boxes on the given image and save the annotated JPEG.

    Args:
        image: BGR np.ndarray (original resolution).
        detections: List of detection dicts (see detector.detect).
        output_filename: Stored filename, e.g. ``{analysis_id}.jpg``.

    Returns:
        ``{"path": "annotated/x.jpg", "url": "/annotated/x.jpg"}``.
    """
    raise NotImplementedError("Implemented in Milestone 3.")


def draw_boxes(image: Any, detections: list) -> Any:
    """Return a copy of the image with detection boxes + labels drawn."""
    raise NotImplementedError("Implemented in Milestone 3.")

