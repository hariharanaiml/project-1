"""
Annotated image generation — Milestone 3 (full implementation).

Draws YOLO-style bounding boxes + label chips onto the original-resolution
image using OpenCV and saves as a JPEG to the uploads/ directory.

Heavy deps (cv2 / numpy) are imported lazily so the app boots without them.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List, Optional

# Backend root for resolving output paths.
_BACKEND_ROOT = Path(__file__).resolve().parent.parent.parent
_ANNOTATED_DIR = _BACKEND_ROOT / "uploads" / "annotated"

# BGR colors for each damage class (OpenCV uses BGR not RGB).
LABEL_COLORS: Dict[str, tuple] = {
    "pothole":            (0,   0,   220),   # red
    "alligator_crack":    (0,  80,   220),   # orange-red
    "longitudinal_crack": (0, 160,   255),   # amber
    "transverse_crack":   (0, 200,   200),   # yellow
    "patchy_road_section": (0, 180,    60),  # green
    "lane_line_blur":     (200, 120,    0),  # teal
    "manhole_cover":      (200,   0,  200),  # magenta
}
_DEFAULT_COLOR = (255, 120, 0)   # blue for unknown classes

_FONT_SCALE  = 0.55
_THICKNESS   = 2
_BOX_ALPHA   = 0.25   # translucency for fill overlay


def draw_boxes(image: Any, detections: List[Dict]) -> Any:
    """
    Return a copy of the image with detection bounding boxes and labels drawn.

    Boxes are drawn with a semi-transparent fill and an opaque border.
    Labels show ``{damage_type} {confidence%}``.

    Args:
        image:      BGR ndarray (original resolution).
        detections: List of detection dicts with keys ``label``, ``confidence``,
                    and ``bbox`` ([x1, y1, x2, y2] normalized 0–1 or pixel-space).

    Returns:
        BGR ndarray with annotations drawn.  Input is not modified.
    """
    try:
        import cv2          # noqa: PLC0415
        import numpy as np  # noqa: PLC0415
    except ImportError:
        return image  # graceful no-op if cv2 unavailable

    output = image.copy()
    h, w = output.shape[:2]
    overlay = output.copy()

    for det in detections:
        label  = (det.get("label") or "unknown").lower()
        conf   = float(det.get("confidence") or 0.0)
        bbox   = det.get("bbox") or [0, 0, 0, 0]

        # Detect coordinate space: normalized (≤1) vs pixel-space.
        x1, y1, x2, y2 = [float(v) for v in bbox[:4]]
        if max(x1, y1, x2, y2) <= 1.0:
            x1, y1, x2, y2 = x1 * w, y1 * h, x2 * w, y2 * h
        px1, py1, px2, py2 = int(x1), int(y1), int(x2), int(y2)

        color = LABEL_COLORS.get(label, _DEFAULT_COLOR)

        # Semi-transparent fill.
        cv2.rectangle(overlay, (px1, py1), (px2, py2), color, -1)

        # Opaque border.
        cv2.rectangle(output, (px1, py1), (px2, py2), color, _THICKNESS)

        # Label chip background.
        display_label = f"{label.replace('_', ' ')} {conf * 100:.0f}%"
        (tw, th), baseline = cv2.getTextSize(
            display_label, cv2.FONT_HERSHEY_SIMPLEX, _FONT_SCALE, _THICKNESS
        )
        chip_y1 = max(py1 - th - baseline - 4, 0)
        chip_y2 = py1
        cv2.rectangle(output, (px1, chip_y1), (px1 + tw + 4, chip_y2), color, -1)
        cv2.putText(
            output,
            display_label,
            (px1 + 2, py1 - baseline - 2),
            cv2.FONT_HERSHEY_SIMPLEX,
            _FONT_SCALE,
            (255, 255, 255),
            1,
            cv2.LINE_AA,
        )

    # Blend overlay (transparent fill).
    cv2.addWeighted(overlay, _BOX_ALPHA, output, 1 - _BOX_ALPHA, 0, output)
    return output


def annotate_image(
    image: Any,
    detections: List[Dict],
    output_filename: str,
) -> Dict[str, Any]:
    """
    Draw detection boxes on the image and save the annotated JPEG.

    Args:
        image:           BGR ndarray (original resolution).
        detections:      Detection list (from YOLODetector.detect()).
        output_filename: Filename for the saved file (e.g. ``{analysis_id}.jpg``).

    Returns:
        ``{"path": "uploads/annotated/x.jpg", "url": "/uploads/annotated/x.jpg"}``
        or an empty dict if cv2 is unavailable or saving fails.
    """
    try:
        import cv2  # noqa: PLC0415
    except ImportError:
        return {}

    annotated = draw_boxes(image, detections)

    _ANNOTATED_DIR.mkdir(parents=True, exist_ok=True)
    out_path = _ANNOTATED_DIR / output_filename

    try:
        cv2.imwrite(str(out_path), annotated, [cv2.IMWRITE_JPEG_QUALITY, 90])
    except Exception:  # noqa: BLE001
        return {}

    rel = f"uploads/annotated/{output_filename}"
    return {
        "path": rel,
        "url": f"/{rel}",
    }
