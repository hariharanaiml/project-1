"""
Detection post-processing helpers — Milestone 3 (full implementation).

Responsibilities:
    - Filter raw YOLO detections by the configured confidence threshold.
    - Convert pixel-space boxes to normalized 0–1 coordinates.
    - Map class ids to the canonical RoadSense damage type labels that match
      the 7 classes in best.pt (Roboflow Road Damage Detection v2 dataset).

No heavy dependencies (no torch/cv2/ultralytics) — this module is
import-safe and can be unit-tested without a GPU or model file.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

# ── Canonical class-id → label mapping for best.pt ────────────────────────────
# Matches the 7 classes in the Roboflow Road Damage Detection v2 dataset.
DAMAGE_CLASS_NAMES: Dict[int, str] = {
    0: "alligator_crack",
    1: "lane_line_blur",
    2: "longitudinal_crack",
    3: "manhole_cover",
    4: "patchy_road_section",
    5: "pothole",
    6: "transverse_crack",
}


def filter_by_confidence(
    detections: List[Dict[str, Any]],
    threshold: float,
) -> List[Dict[str, Any]]:
    """
    Keep only detections whose confidence is at or above ``threshold``.

    Args:
        detections: Raw detection list (each dict must have a ``confidence`` key).
        threshold:  Minimum confidence in [0, 1].

    Returns:
        Filtered detection list (new list; input is not modified).
    """
    if threshold <= 0.0:
        return list(detections)
    return [d for d in detections if float(d.get("confidence") or 0.0) >= threshold]


def normalize_bboxes(
    detections: List[Dict[str, Any]],
    original_width: int,
    original_height: int,
) -> List[Dict[str, Any]]:
    """
    Normalize pixel-space [x1, y1, x2, y2] boxes to 0–1 coordinates.

    Each detection dict is expected to have a ``bbox`` key with a 4-element
    list in pixel space.  The normalized values are clamped to [0, 1].

    Args:
        detections:      Detection list with pixel-space ``bbox`` values.
        original_width:  Original image width in pixels.
        original_height: Original image height in pixels.

    Returns:
        New detection list with normalized boxes.  Detections that already
        have values in [0, 1] (i.e. already normalized) are left untouched.
    """
    w, h = float(original_width or 1), float(original_height or 1)
    result = []
    for det in detections:
        det = dict(det)  # shallow copy — don't mutate caller's data
        raw = det.get("bbox") or [0.0, 0.0, 0.0, 0.0]
        x1, y1, x2, y2 = (float(v) for v in raw[:4])
        # Heuristic: if values are already ≤ 1 they are already normalized.
        if max(x1, y1, x2, y2) > 1.0:
            x1 /= w
            y1 /= h
            x2 /= w
            y2 /= h
        det["bbox"] = [
            round(max(0.0, min(1.0, x1)), 4),
            round(max(0.0, min(1.0, y1)), 4),
            round(max(0.0, min(1.0, x2)), 4),
            round(max(0.0, min(1.0, y2)), 4),
        ]
        result.append(det)
    return result


def map_class_ids(
    detections: List[Dict[str, Any]],
    names: Optional[Dict[int, str]] = None,
) -> List[Dict[str, Any]]:
    """
    Map class ids to human-readable RoadSense damage labels.

    Priority order:
    1. ``DAMAGE_CLASS_NAMES`` — canonical snake_case RoadSense class table.
    2. ``names`` argument (e.g. from model.names) normalized to snake_case.
    3. Fallback: ``other`` for unknown class ids.

    Args:
        detections: Detection list with ``class_id`` keys.
        names:      Optional model class-id → label mapping.

    Returns:
        Detection list with ``label`` field populated/overwritten.
    """
    lookup = {}
    if names:
        lookup.update(
            {int(k): str(v).strip().lower().replace(" ", "_").replace("-", "_") for k, v in names.items()}
        )
    # Canonical DAMAGE_CLASS_NAMES takes priority over raw model names with spaces
    lookup.update(DAMAGE_CLASS_NAMES)

    result = []
    for det in detections:
        det = dict(det)
        class_id = det.get("class_id")
        if class_id is not None and int(class_id) in lookup:
            det["label"] = lookup[int(class_id)]
        elif "label" in det:
            det["label"] = str(det["label"]).strip().lower().replace(" ", "_").replace("-", "_")
        elif class_id is not None:
            det["label"] = f"damage_class_{class_id}"
        else:
            det["label"] = "other"
        result.append(det)
    return result


def bbox_area(bbox: List[float]) -> float:
    """
    Return the fractional area of a normalized bounding box.

    Args:
        bbox: [x1, y1, x2, y2] all in [0, 1].

    Returns:
        Area in [0, 1] (fraction of total image area).
    """
    if len(bbox) < 4:
        return 0.0
    x1, y1, x2, y2 = bbox[:4]
    width = max(0.0, float(x2) - float(x1))
    height = max(0.0, float(y2) - float(y1))
    return round(width * height, 6)
