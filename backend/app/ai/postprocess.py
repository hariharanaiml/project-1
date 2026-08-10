"""
Detection post-processing helpers (Phase 13 — Milestone 2 scaffold).

Responsibilities (Milestone 3):
    - Filter raw YOLO detections by the configured confidence threshold.
    - Convert pixel-space boxes to normalized 0–1 coordinates.
    - Apply NMS / de-duplication if needed.
    - Map class ids to ``app.models.enums.DamageType`` labels.

Import-safe scaffold only — this module must not import heavy deps
(``ultralytics`` / ``torch`` / ``cv2``) so the app always boots. Full
implementation lands in Milestone 3.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional


def filter_by_confidence(detections: List[Dict[str, Any]], threshold: float) -> List[Dict[str, Any]]:
    """
    Keep only detections whose confidence is at or above ``threshold``.

    Args:
        detections: Raw detection list (each with a ``confidence`` key).
        threshold: Minimum confidence (0–1).

    Returns:
        Filtered detection list.
    """
    raise NotImplementedError("Implemented in Milestone 3.")


def normalize_bboxes(
    detections: List[Dict[str, Any]],
    original_width: int,
    original_height: int,
) -> List[Dict[str, Any]]:
    """
    Normalize pixel-space [x1, y1, x2, y2] boxes to 0–1 coordinates.

    Args:
        detections: Detection list with pixel-space ``bbox`` values.
        original_width: Original image width in pixels.
        original_height: Original image height in pixels.

    Returns:
        Detection list with normalized boxes.
    """
    raise NotImplementedError("Implemented in Milestone 3.")


def map_class_ids(detections: List[Dict[str, Any]], names: Optional[Dict[int, str]] = None) -> List[Dict[str, Any]]:
    """
    Map class ids to human-readable labels (fallback: ``other`` for unknown).

    Args:
        detections: Detection list with ``class_id`` keys.
        names: Optional model class-id → label mapping.

    Returns:
        Detection list with ``label`` populated.
    """
    raise NotImplementedError("Implemented in Milestone 3.")
